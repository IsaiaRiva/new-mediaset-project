// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import SolutionManifest from '/solution-manifest.js';
import ApiHelper from '../apiHelper.js';
import AppUtils from '../appUtils.js';
import {
  GetS3Utils,
} from '../s3utils.js';
import {
  GetFaceStore,
} from '../localCache/index.js';

const {
  Proxy: {
    Bucket: PROXY_BUCKET,
  },
} = SolutionManifest;

const ON_FACE_COLLECTION_ADDED = 'facemanager:collection:added';
const ON_FACE_COLLECTION_REMOVED = 'facemanager:collection:removed';
const ON_FACE_ADDED = 'facemanager:face:added';
const ON_FACE_REMOVED = 'facemanager:face:removed';

/* singleton implementation */
let _singleton;

/* receive update event on face manager event */
const _receivers = {};

const _onFaceManagerEvent = (event, data) => {
  setTimeout(async () => {
    const names = Object.keys(_receivers);
    try {
      await Promise.all(
        names.map((name) =>
          _receivers[name](event, data)
            .catch((e) => {
              console.error(
                'ERR:',
                `_onFaceManagerEvent.${event}.${name}:`,
                e.message
              );
              return undefined;
            }))
      );

      console.log(
        'INFO:',
        `_onFaceManagerEvent.${event}:`,
        `${names.length} receivers:`,
        names.join(', ')
      );
    } catch (e) {
      console.error(
        'ERR:',
        `_onFaceManagerEvent.${event}:`,
        e
      );
    }
  }, 10);
};

class FaceManager {
  constructor() {
    this.$faceStore = GetFaceStore();
    this.$collections = [];
    this.$facesByCollection = {};

    _singleton = this;
  }

  get faceStore() {
    return this.$faceStore;
  }

  get collections() {
    return this.$collections;
  }

  set collections(val) {
    this.$collections = val;
  }

  get facesByCollection() {
    return this.$facesByCollection;
  }

  set facesByCollection(val) {
    this.$facesByCollection = val;
  }

  async getCollections() {
    try {
      if (this.collections.length === 0) {
        this.collections = await ApiHelper.getFaceCollections();
      }

      return this.collections;
    } catch (e) {
      console.error(e);
      return this.collections;
    }
  }

  async refreshCollections() {
    this.facesByCollection = {};

    this.collections.length = 0;
    await this.getCollections();

    return this.collections;
  }

  async createCollection(collectionId) {
    try {
      const collection = await ApiHelper.createFaceCollection(collectionId);

      if (!(collection || {}).name) {
        return undefined;
      }

      const idx = this.collections
        .findIndex((x) =>
          x.name === collection.name);

      if (idx < 0) {
        this.collections.push(collection);

        _onFaceManagerEvent(
          ON_FACE_COLLECTION_ADDED,
          collection
        );
      }

      return collection;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  async deleteCollection(collectionId) {
    try {
      await ApiHelper.deleteFaceCollection(collectionId);

      if (this.collections.length) {
        const idx = this.collections
          .findIndex((x) =>
            x.name === collectionId);

        if (idx >= 0) {
          const deleted = this.collections.splice(idx, 1);

          _onFaceManagerEvent(
            ON_FACE_COLLECTION_REMOVED,
            deleted[0]
          );
        }
      }

      delete this.facesByCollection[collectionId];
    } catch (e) {
      console.error(e);
    }
  }

  async getFacesInCollection(
    collectionId,
    token
  ) {
    try {
      if (!token
      && this.facesByCollection[collectionId]
      && this.facesByCollection[collectionId].faces.length) {
        return this.facesByCollection[collectionId];
      }

      const response = await ApiHelper.getFacesInCollection(
        collectionId,
        {
          token,
        }
      );

      if (this.facesByCollection[collectionId] === undefined) {
        this.facesByCollection[collectionId] = {
          faces: [],
        };
      }

      this.facesByCollection[collectionId].faces
        = this.facesByCollection[collectionId].faces.concat(response.faces);

      this.facesByCollection[collectionId].token
        = response.token;

      return this.facesByCollection[collectionId];
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  async getFaceImage(key) {
    try {
      if (!key) {
        return undefined;
      }

      let blob = await this.faceStore.getItem(key);

      if (!blob) {
        const s3utils = GetS3Utils();
        const url = await s3utils.signUrl(
          PROXY_BUCKET,
          key
        );

        blob = await this.storeFace(
          key,
          url
        );
      }

      if (blob) {
        return URL.createObjectURL(blob);
      }

      return undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  async deleteFace(
    collectionId,
    faceId
  ) {
    try {
      await ApiHelper.deleteFaceFromCollection(
        collectionId,
        faceId
      ).then((res) => {
        /* make sure to update the collection face count */
        const found = this.collections
          .find((collection) =>
            collection.name === collectionId);
        found.faces -= 1;

        return res;
      });

      if (this.facesByCollection[collectionId]) {
        const idx = this.facesByCollection[collectionId].faces
          .findIndex((face) =>
            face.faceId === faceId);

        if (idx >= 0) {
          const deleted = this.facesByCollection[collectionId].faces
            .splice(idx, 1);

          _onFaceManagerEvent(ON_FACE_REMOVED, {
            collectionId,
            ...deleted[0],
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async indexFace(
    collectionId,
    name,
    data
  ) {
    try {
      const externalImageId = name
        .replace(/\s/g, '_');

      const payload = {
        externalImageId,
        blob: data,
      };

      const response = await ApiHelper.indexFaceToCollection(
        collectionId,
        payload
      ).then((res) => {
        /* make sure to update the collection face count */
        const found = this.collections
          .find((collection) =>
            collection.name === collectionId);
        found.faces += 1;
        return res;
      });

      let newFace;
      if (response.externalImageId && response.faceId) {
        const blob = await this.storeFace(
          response.key,
          data
        ).then((res) =>
          URL.createObjectURL(res));

        newFace = {
          externalImageId: response.externalImageId,
          faceId: response.faceId,
          blob,
        };

        if (this.facesByCollection[collectionId] === undefined) {
          await this.getFacesInCollection(
            collectionId
          );

          _onFaceManagerEvent(ON_FACE_ADDED, {
            collectionId,
            ...newFace,
          });

          return newFace;
        }

        const idx = this.facesByCollection[collectionId]
          .faces
          .findIndex((face) =>
            face.faceId === newFace.faceId);

        if (idx < 0) {
          this.facesByCollection[collectionId]
            .faces
            .push(newFace);

          _onFaceManagerEvent(ON_FACE_ADDED, {
            collectionId,
            ...newFace,
          });
        }
      }

      return newFace;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  async storeFace(
    name,
    blobOrUrl
  ) {
    let blob = await AppUtils.downscale(blobOrUrl);

    blob = await fetch(blob);
    blob = await blob.blob();

    await this.faceStore.putItem(name, blob);

    return blob;
  }
}

const GetFaceManager = () => {
  if (_singleton === undefined) {
    const notused_ = new FaceManager();
  }

  return _singleton;
};

const RegisterFaceManagerEvent = (name, target) => {
  if (!name || typeof target !== 'function') {
    return false;
  }

  _receivers[name] = target;
  return true;
};

const UnregisterFaceManagerEvent = (name) => {
  delete _receivers[name];
};

export {
  FaceManager,
  GetFaceManager,
  RegisterFaceManagerEvent,
  UnregisterFaceManagerEvent,
  ON_FACE_COLLECTION_ADDED,
  ON_FACE_COLLECTION_REMOVED,
  ON_FACE_ADDED,
  ON_FACE_REMOVED,
};
