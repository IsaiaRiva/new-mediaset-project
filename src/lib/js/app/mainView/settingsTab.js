// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Localization from '../shared/localization.js';
import {
  GetLocalStoreDB,
} from '../shared/localCache/index.js';
import mxAnalysisSettings from '../mixins/mxAnalysisSettings.js';
import BaseTab from '../shared/baseTab.js';

const {
  Messages: {
    SettingsTab: TITLE,
    DatastoreFeature: MSG_DATASTORE_FEATURE,
    DatastoreFeatureDesc: MSG_DATASTORE_FEATURE_DESC,
  },
  Buttons: {
    CleanupDatastore: BTN_CLEANUP_DATASTORE,
  },
} = Localization;

const HASHTAG = TITLE.replaceAll(' ', '');

export default class SettingsTab extends mxAnalysisSettings(BaseTab) {
  constructor() {
    super(TITLE, {
      hashtag: HASHTAG,
    });
  }

  get parentContainer() {
    return this.tabContent;
  }

  createSkeleton() {
    const row = super.createSkeleton();
    const datastore = this.createDatastoreForm();
    const first = row.children().first();
    first.after($('<div/>').addClass('col-9 p-0 mx-auto mt-4')
      .append(datastore));
    return row;
  }

  createDatastoreForm() {
    const title = $('<span/>').addClass('d-block p-2 bg-light text-black lead')
      .html(MSG_DATASTORE_FEATURE);
    const desc = $('<p/>').addClass('lead-s mt-4')
      .html(MSG_DATASTORE_FEATURE_DESC);
    const form = $('<form/>').addClass('col-9 px-0 form-inline mt-4')
      .attr('role', 'form');
    const btn = $('<button/>').addClass('btn btn-sm btn-outline-danger')
      .attr('type', 'button')
      .attr('data-toggle', 'button')
      .attr('aria-pressed', 'false')
      .attr('autocomplete', 'off')
      .append(BTN_CLEANUP_DATASTORE);
    btn.off('click').on('click', async (event) => {
      this.loading(true);
      event.preventDefault();
      event.stopPropagation();
      const db = GetLocalStoreDB();
      await db.clearAllStores();
      this.loading(false);
      return false;
    });

    form.append(btn);
    form.submit((event) =>
      event.preventDefault());
    return $('<div/>').addClass('ai-group')
      .addClass('overflow-auto my-auto align-content-start')
      .append($('<div/>').addClass('mt-4')
        .append(title)
        .append(desc)
        .append(form));
  }
}
