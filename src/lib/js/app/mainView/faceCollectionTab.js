// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Localization from '../shared/localization.js';
import AppUtils from '../shared/appUtils.js';
import Spinner from '../shared/spinner.js';
import mxAlert from '../mixins/mxAlert.js';
import BaseTab from '../shared/baseTab.js';
import {
  GetFaceManager,
  RegisterFaceManagerEvent,
  ON_FACE_ADDED,
  ON_FACE_REMOVED,
} from '../shared/faceManager/index.js';

const {
  Messages: {
    FaceCollectionTab: TITLE,
    FaceCollectionDesc: MSG_FACE_COLLECTION_DESC,
    AvailableFaceCollections: MSG_AVAILABLE_FACE_COLLECTIONS,
    SelectFaceCollection: MSG_SELECT_FACE_COLLECTION,
    Alternatively: MSG_ALTERNATIVELY,
    IndexedFacesInCollection: MSG_FACES_IN_COLLECTION,
    NoMoreData: MSG_NO_MORE_DATA,
  },
  Tooltips: {
    RemoveFaceCollection: TOOLTIP_REMOVE_COLLECTION,
    RemoveFaceFromCollection: TOOLTIP_REMOVE_FACE,
  },
  Buttons: {
    CreateNewCollection: BTN_CREATE_NEW_COLLECTION,
    RemoveFaceCollection: BTN_REMOVE_COLLECTION,
    LoadMore: BTN_LOAD_MORE,
  },
  Alerts: {
    Oops: OOPS,
    InvalidFaceCollectionName: ERR_INVALID_FACE_COLLECTION_NAME,
  },
} = Localization;

const HASHTAG = TITLE.replaceAll(' ', '');

export default class FaceCollectionTab extends mxAlert(BaseTab) {
  constructor() {
    super(TITLE, {
      hashtag: HASHTAG,
    });

    this.$faceCollectionContainerId = `facecolllectioncontainer-${this.id}`;
    this.$indexedFaceContainerId = `indexedfacecontainer-${this.id}`;

    this.$faceManager = GetFaceManager();

    RegisterFaceManagerEvent(
      'facecollectiontab',
      this.onFaceManagerEvent.bind(this)
    );

    Spinner.useSpinner();
  }

  get faceManager() {
    return this.$faceManager;
  }

  get faceCollectionContainerId() {
    return this.$faceCollectionContainerId;
  }

  get indexedFaceContainerId() {
    return this.$indexedFaceContainerId;
  }

  async show(hashtag) {
    if (!this.initialized) {
      const content = await this.createContent();
      this.tabContent.append(content);
    }

    return super.show(hashtag);
  }

  async createContent() {
    const container = $('<div/>')
      .addClass('row no-gutters');

    const descContainer = $('<div/>')
      .addClass('col-9 p-0 mx-auto mt-4');
    container.append(descContainer);

    const desc = this.createDescription();
    descContainer.append(desc);

    const collectionContainer = $('<div/>')
      .addClass('col-9 p-0 mx-auto mt-4');
    container.append(collectionContainer);

    const collectionList = this.createCollectionList();
    collectionContainer.append(collectionList);

    const indexedFaceContainer = $('<div/>')
      .addClass('col-12 p-0 m-0 p-0 bg-light');
    container.append(indexedFaceContainer);

    const indexedFaceList = $('<div/>')
      .addClass('col-9 p-0 mx-auto mt-4 collapse')
      .attr('id', this.indexedFaceContainerId);
    indexedFaceContainer.append(indexedFaceList);

    return container;
  }

  createDescription() {
    return $('<p/>')
      .addClass('lead')
      .html(MSG_FACE_COLLECTION_DESC);
  }

  createCollectionList() {
    const container = $('<div/>')
      .addClass('col-12 p-0 m-0');

    const title = $('<span/>')
      .addClass('d-block p-0 lead')
      .html(MSG_AVAILABLE_FACE_COLLECTIONS);
    container.append(title);

    const formContainer = $('<form/>')
      .addClass('form-inline needs-validation my-4')
      .attr('novalidate', 'novalidate');
    container.append(formContainer);

    /* select */
    const selectContainer = $('<select/>')
      .addClass('custom-select custom-select-sm col-3')
      .attr('id', this.faceCollectionContainerId);
    formContainer.append(selectContainer);

    const defaultOption = $('<option/>')
      .attr('value', 'undefined')
      .html(MSG_SELECT_FACE_COLLECTION);
    selectContainer.append(defaultOption);

    /* refresh */
    const btnRefresh = $('<button/>')
      .addClass('btn btn-sm btn-outline-dark');
    formContainer.append(btnRefresh);

    const iconRefresh = $('<i/>')
      .addClass('fas fa-sync-alt');
    btnRefresh.append(iconRefresh);

    /* new collection */
    const labelAlternatively = $('<span/>')
      .addClass('lead ml-4 mr-1')
      .html(MSG_ALTERNATIVELY);
    formContainer.append(labelAlternatively);

    const inputCollectionName = $('<input/>')
      .addClass('form-control form-control-sm col-3')
      .attr('pattern', '^[a-zA-Z0-9_.-]{0,255}$')
      .attr('placeholder', '(Blank)');
    formContainer.append(inputCollectionName);

    const btnCreateNewCollection = $('<button/>')
      .addClass('btn btn-sm btn-success')
      .append(BTN_CREATE_NEW_COLLECTION);
    formContainer.append(btnCreateNewCollection);

    container.ready(async () => {
      const indexedFaceContainer = this.tabContent
        .find(`#${this.indexedFaceContainerId}`);

      /* events */
      formContainer.submit((event) =>
        event.preventDefault());

      selectContainer.on('change', async () => {
        const val = selectContainer.val();

        if (val === 'undefined') {
          return indexedFaceContainer
            .addClass('collapse');
        }

        return this.renderIndexedFaces(
          val,
          indexedFaceContainer
        );
      });

      btnRefresh.on('click', async () => {
        await this.refreshCollectionList(selectContainer);
        return false;
      });

      btnCreateNewCollection.on('click', async (event) => {
        if (!this.validateForm(event, formContainer)) {
          this.shake(formContainer);

          await this.showAlert(ERR_INVALID_FACE_COLLECTION_NAME);

          inputCollectionName.focus();
          return false;
        }

        if (!inputCollectionName.val()) {
          return false;
        }

        try {
          Spinner.loading();

          const collectionName = inputCollectionName.val();
          const collection = await this.faceManager
            .createCollection(collectionName);

          if (collection) {
            const option = $('<option/>')
              .attr('value', collection.name);

            const desc = `${collection.name} (${collection.faces} faces)`;
            option.html(desc);

            selectContainer.append(option);

            /* select the newly created collection */
            selectContainer
              .val(collection.name)
              .trigger('change');
          }

          /* reset input */
          inputCollectionName.val('');

          return true;
        } catch (e) {
          console.error(e);
          return false;
        } finally {
          Spinner.loading(false);
        }
      });

      const collections = await this.faceManager.getCollections();

      const options = collections
        .map((collection) => {
          const option = $('<option/>')
            .attr('value', collection.name);

          const desc = `${collection.name} (${collection.faces} faces)`;
          option.html(desc);

          return option;
        });

      selectContainer.append(options);
    });

    return container;
  }

  validateForm(event, form) {
    event.preventDefault();

    if (form[0].checkValidity() === false) {
      event.stopPropagation();
      return false;
    }

    return true;
  }

  async renderIndexedFaces(collectionId, container) {
    try {
      Spinner.loading();

      container.children()
        .remove();

      let promiseFaces = this.faceManager
        .getFacesInCollection(collectionId);

      /* title / delete collection */
      const section = $('<div/>')
        .addClass('row no-gutters');
      container.append(section);

      const descContainer = $('<div/>')
        .addClass('col-6 p-0 m-0');
      section.append(descContainer);

      let desc = MSG_FACES_IN_COLLECTION
        .replace('{{FACE_COLLECTION}}', collectionId);
      desc = $('<span/>')
        .addClass('d-block p-0 lead')
        .html(desc);
      descContainer.append(desc);

      /* delete collection control */
      const btnContainer = $('<div/>')
        .addClass('col-6 p-0 m-0 text-left');
      section.append(btnContainer);

      const deleteBtn = this.makeFaceCollectionDeleteBtn(collectionId);
      btnContainer.append(deleteBtn
        .addClass('float-right'));

      /* table */
      const table = $('<table/>')
        .addClass('table table-hover my-4 lead-xs');
      container.append(table);

      const thead = $('<thead/>');
      table.append(thead);

      const headerRow = this.makeFaceTableHeaderRow();
      thead.append(headerRow);

      const tbody = $('<tbody/>');
      table.append(tbody);

      promiseFaces = await promiseFaces;
      const tableRows = promiseFaces.faces
        .map((face) =>
          this.makeFaceTableRow(
            collectionId,
            face
          ));
      tbody.append(tableRows);

      /* load more */
      const moreBtn = this.makeLoadMoreBtn(
        table,
        collectionId,
        promiseFaces.token
      );
      container.append(moreBtn);

      container.removeClass('collapse');
    } catch (e) {
      console.error(e);
    } finally {
      Spinner.loading(false);
    }
  }

  makeFaceTableHeaderRow() {
    const container = $('<tr/>');

    const rows = [
      '#',
      'ExternalImageId',
      'FriendlyName',
      'FaceId',
      'Remove?',
    ].map((x) =>
      $('<th/>')
        .addClass('align-middle text-center lead-sm')
        .attr('scope', 'col')
        .append(x));
    container.append(rows);

    return container;
  }

  makeFaceTableRow(collectionId, data) {
    const container = $('<tr/>');

    let key = data.key;
    if (data.blob !== undefined) {
      key = data.blob;
    }

    const image = this.makeFaceTableRowImage(key);
    container.append(image);

    const externalImageId = this.makeFaceTableRowItem(data.externalImageId);
    container.append(externalImageId);

    const friendlyName = this.makeFaceTableRowItem(
      AppUtils.toFriendlyName(data.externalImageId)
    );
    container.append(friendlyName);

    const faceId = this.makeFaceTableRowItem(data.faceId);
    container.append(faceId);

    const deleteBtn = this.makeFaceTableRowDeleteBtn(
      collectionId,
      data.faceId
    );
    container.append(deleteBtn);

    return container;
  }

  makeFaceTableRowImage(key) {
    const container = $('<td/>')
      .addClass('h-100 align-middle text-center')
      .addClass('m-0 p-0');

    container.ready(async () => {
      let image;
      let blob;

      if (key && key.indexOf('blob:') === 0) {
        blob = key;
      } else {
        blob = await this.faceManager.getFaceImage(key);
      }

      if (blob === undefined) {
        image = $('<div/>')
          .addClass('face-thumbnail');

        const iconImage = $('<i/>')
          .addClass('fas fa-eye-slash text-white');

        image.append(iconImage);
      } else {
        image = $('<img/>')
          .addClass('face-thumbnail')
          .attr('src', blob);
      }

      container.append(image);
    });

    return container;
  }

  makeFaceTableRowItem(name) {
    return $('<td/>')
      .addClass('h-100 align-middle text-center')
      .append(name);
  }

  makeFaceCollectionDeleteBtn(collectionId) {
    const deletBtn = $('<button/>')
      .addClass('btn btn-sm btn-danger')
      .attr('type', 'button')
      .attr('data-toggle', 'tooltip')
      .attr('data-placement', 'bottom')
      .attr('title', TOOLTIP_REMOVE_COLLECTION)
      .html(BTN_REMOVE_COLLECTION)
      .tooltip({
        trigger: 'hover',
      });

    deletBtn.on('click', async () => {
      try {
        Spinner.loading();
        deletBtn.tooltip('hide')
          .addClass('disabled')
          .attr('disabled', 'disabled');
        await this.faceManager.deleteCollection(collectionId);

        const select = this.tabContent
          .find(`select#${this.faceCollectionContainerId}`);

        /* force it to switch */
        select.val('undefined')
          .trigger('change');

        select.find(`option[value="${collectionId}"]`)
          .remove();
      } catch (e) {
        console.error(e);
      } finally {
        Spinner.loading(false);
      }
    });

    return deletBtn;
  }

  makeFaceTableRowDeleteBtn(collectionId, faceId) {
    const container = $('<td/>')
      .addClass('h-100 align-middle text-center');

    const deleteBtn = $('<button/>')
      .addClass('btn btn-sm btn-outline-danger')
      .attr('type', 'button')
      .attr('data-toggle', 'tooltip')
      .attr('data-placement', 'bottom')
      .attr('title', TOOLTIP_REMOVE_FACE)
      .tooltip({
        trigger: 'hover',
      });
    container.append(deleteBtn);

    const deleteIcon = $('<i/>')
      .addClass('far fa-trash-alt');
    deleteBtn.append(deleteIcon);

    deleteBtn.on('click', async () => {
      try {
        Spinner.loading();

        deleteBtn.tooltip('hide')
          .addClass('disabled')
          .attr('disabled', 'disabled');

        await this.faceManager.deleteFace(collectionId, faceId);

        const parent = deleteBtn.parents('tr');

        parent.remove();
      } catch (e) {
        console.error(e);
      } finally {
        Spinner.loading(false);
      }
    });

    return container;
  }

  makeLoadMoreBtn(table, collectionId, token) {
    const container = $('<div/>')
      .addClass('col-12 text-center mb-4');

    const moreBtn = $('<button/>')
      .addClass('btn btn-sm btn-outline-dark')
      .html(BTN_LOAD_MORE);
    container.append(moreBtn);

    moreBtn.data('token', token);
    if (!token || token === 'undefined') {
      moreBtn.addClass('disabled')
        .attr('disabled', 'disabled')
        .html(MSG_NO_MORE_DATA);
    }

    moreBtn.on('click', async () => {
      try {
        Spinner.loading();
        const refreshToken = moreBtn.data('token');

        const response = await this.faceManager.getFacesInCollection(
          collectionId,
          refreshToken
        );

        const tbody = table.find('tbody');
        const tableRows = response.faces
          .map((face) =>
            this.makeFaceTableRow(collectionId, face));
        tbody.append(tableRows);

        moreBtn.data('token', response.token);

        if (!response.token) {
          moreBtn.addClass('disabled')
            .attr('disabled', 'disabled')
            .html(MSG_NO_MORE_DATA);
        }
      } catch (e) {
        console.error(e);
      } finally {
        Spinner.loading(false);
      }
    });

    return container;
  }

  async refreshCollectionList(select) {
    try {
      Spinner.loading();

      select.val('undefined')
        .trigger('change');

      select
        .find('option[value!="undefined"]')
        .remove();

      const collection = await this.faceManager.refreshCollections();

      const options = collection
        .map((option) =>
          $('<option/>')
            .attr('value', option.name)
            .html(`${option.name} (${option.faces} faces)`));

      select.append(options);
    } catch (e) {
      console.error(e);
    } finally {
      Spinner.loading(false);
    }
  }

  async showAlert(message, duration) {
    return super.showMessage(
      this.tabContent,
      'danger',
      OOPS,
      message,
      duration
    );
  }

  async onFaceManagerEvent(
    event,
    data
  ) {
    /* only handle face added event */
    if (event !== ON_FACE_ADDED && event !== ON_FACE_REMOVED) {
      return;
    }

    const option = this.tabContent
      .find(`select#${this.faceCollectionContainerId}`)
      .find(`option[value="${data.collectionId}"]`);

    if (option.length === 0) {
      return;
    }

    const faces = await this.faceManager.getFacesInCollection(
      data.collectionId
    ).then((res) =>
      res.faces);

    const collectionName = option.val();
    const desc = `${collectionName} (${faces.length} faces)`;
    option.html(desc);

    if (event === ON_FACE_ADDED && option.is(':selected')) {
      /* redner the newly added face */
      const tbody = this.tabContent
        .find(`#${this.indexedFaceContainerId}`)
        .find('tbody');

      if (tbody.length === 0) {
        return;
      }

      const row = this.makeFaceTableRow(
        data.collectionId,
        data
      );

      tbody.append(row);
    }
  }
}
