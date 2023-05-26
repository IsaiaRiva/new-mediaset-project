// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import SolutionManifest from '/solution-manifest.js';
import AuthHttpRequest from './authHttpRequest.js';

const {
  ApiEndpoint,
  ApiOps,
  KnowledgeGraph,
} = SolutionManifest;

const ENDPOINTS = {
  Asset: `${ApiEndpoint}/${ApiOps.Assets}`,
  Analysis: `${ApiEndpoint}/${ApiOps.Analysis}`,
  Search: `${ApiEndpoint}/${ApiOps.Search}`,
  Execution: `${ApiEndpoint}/${ApiOps.Execution}`,
  AttachIot: `${ApiEndpoint}/${ApiOps.AttachPolicy}`,
  FaceCollections: `${ApiEndpoint}/${ApiOps.FaceCollections}`,
  FaceCollection: `${ApiEndpoint}/${ApiOps.FaceCollection}`,
  Faces: `${ApiEndpoint}/${ApiOps.Faces}`,
  Face: `${ApiEndpoint}/${ApiOps.Face}`,
  CustomLabelModels: `${ApiEndpoint}/${ApiOps.CustomLabelModels}`,
  CustomVocabularies: `${ApiEndpoint}/${ApiOps.CustomVocabularies}`,
  CustomLanguageModels: `${ApiEndpoint}/${ApiOps.CustomLanguageModels}`,
  CustomEntityRecognizers: `${ApiEndpoint}/${ApiOps.CustomEntityRecognizers}`,
  Stats: `${ApiEndpoint}/${ApiOps.Stats}`,
  Users: `${ApiEndpoint}/${ApiOps.Users}`,
  AIOptionsSettings: `${ApiEndpoint}/${ApiOps.AIOptionsSettings}`,
};

let GRAPH_ENDPOINT;
let GRAPH_APIKEY;
if (KnowledgeGraph && KnowledgeGraph.Endpoint && KnowledgeGraph.ApiKey) {
  GRAPH_ENDPOINT = `${KnowledgeGraph.Endpoint}/graph`;
  GRAPH_APIKEY = KnowledgeGraph.ApiKey;
}

const _authHttpRequest = new AuthHttpRequest();

export default class ApiHelper {
  /* record related methods */
  static async scanRecords(query) {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.Asset,
      query
    );
  }

  static async getRecord(uuid) {
    return _authHttpRequest.send(
      'GET',
      `${ENDPOINTS.Asset}/${uuid}`
    );
  }

  static async purgeRecord(uuid) {
    return _authHttpRequest.send(
      'DELETE',
      `${ENDPOINTS.Asset}/${uuid}`
    );
  }

  /* aiml results */
  static async getAnalysisResults(uuid) {
    return _authHttpRequest.send(
      'GET',
      `${ENDPOINTS.Analysis}/${uuid}`
    );
  }

  /* iot */
  static async attachIot() {
    return _authHttpRequest.send(
      'POST',
      ENDPOINTS.AttachIot
    );
  }

  /* search method */
  static async search(query) {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.Search,
      query
    );
  }

  static async searchInDocument(docId, query) {
    return _authHttpRequest.send(
      'GET',
      `${ENDPOINTS.Search}/${docId}`,
      query
    );
  }

  /* workflow related methods */
  static async startIngestWorkflow(body, query) {
    return _authHttpRequest.send(
      'POST',
      ENDPOINTS.Asset,
      query,
      body
    );
  }

  static async startAnalysisWorkflow(uuid, body, query) {
    return _authHttpRequest.send(
      'POST',
      `${ENDPOINTS.Analysis}/${uuid}`,
      query,
      body
    );
  }

  static async startWorkflow(body, query) {
    return _authHttpRequest.send(
      'POST',
      ENDPOINTS.Asset,
      query,
      body
    );
  }

  static async getRekognitionFaceCollections() {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.FaceCollections
    );
  }

  static async getRekognitionCustomLabelModels() {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.CustomLabelModels
    );
  }

  static async getTranscribeCustomVocabulary() {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.CustomVocabularies
    );
  }

  static async getTranscribeCustomLanguageModels() {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.CustomLanguageModels
    );
  }

  static async getComprehendCustomEntityRecognizers() {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.CustomEntityRecognizers
    );
  }

  /* stats */
  static async getStats(query) {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.Stats,
      query
    );
  }

  /* face collection */
  static async getFaceCollections() {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.FaceCollections
    );
  }

  static async createFaceCollection(collectionId) {
    return _authHttpRequest.send(
      'POST',
      ENDPOINTS.FaceCollection,
      undefined,
      {
        collectionId,
      }
    );
  }

  static async deleteFaceCollection(collectionId) {
    return _authHttpRequest.send(
      'DELETE',
      ENDPOINTS.FaceCollection,
      {
        collectionId,
      }
    );
  }

  static async getFacesInCollection(collectionId, options) {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.Faces,
      {
        ...options,
        collectionId,
      }
    );
  }

  static async deleteFaceFromCollection(collectionId, faceId) {
    return _authHttpRequest.send(
      'DELETE',
      ENDPOINTS.Face,
      {
        collectionId,
        faceId,
      }
    );
  }

  static async indexFaceToCollection(collectionId, options) {
    return _authHttpRequest.send(
      'POST',
      ENDPOINTS.Face,
      undefined,
      {
        ...options,
        collectionId,
      }
    );
  }

  /* user management */
  static async getUsers() {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.Users
    );
  }

  static async addUsers(users) {
    return _authHttpRequest.send(
      'POST',
      ENDPOINTS.Users,
      undefined,
      users
    );
  }

  static async deleteUser(user) {
    return _authHttpRequest.send(
      'DELETE',
      ENDPOINTS.Users,
      {
        user,
      }
    );
  }

  /* manage aiOptions settings */
  static async getGlobalAIOptions() {
    return _authHttpRequest.send(
      'GET',
      ENDPOINTS.AIOptionsSettings
    );
  }

  static async setGlobalAIOptions(aiOptions) {
    return _authHttpRequest.send(
      'POST',
      ENDPOINTS.AIOptionsSettings,
      undefined,
      aiOptions
    );
  }

  static async deleteGlobalAIOptions() {
    return _authHttpRequest.send(
      'DELETE',
      ENDPOINTS.AIOptionsSettings
    );
  }

  static async graph(query) {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': GRAPH_APIKEY,
    };

    let tries = 4;
    while (tries--) {
      try {
        const response = await _authHttpRequest.send(
          'GET',
          GRAPH_ENDPOINT,
          query,
          '',
          headers
        );
        return response;
      } catch (e) {
        console.log(`== ApiHelper.graph: #${tries}`);
        console.error(e);
      }
    }

    return undefined;
  }
}
