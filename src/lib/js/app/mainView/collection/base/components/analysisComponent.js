// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  GetUserSession,
} from '../../../../shared/cognito/userSession.js';
import AnalysisTypes from '../../../../shared/analysis/analysisTypes.js';
/* analysis summary */
import StatisticsTab from './analysis/statistics/statisticsTab.js';
/* rekog video */
import CelebTab from './analysis/rekognition/video/celebTab.js';
import LabelTab from './analysis/rekognition/video/labelTab.js';
import FaceMatchTab from './analysis/rekognition/video/faceMatchTab.js';
import FaceTab from './analysis/rekognition/video/faceTab.js';
import ModerationTab from './analysis/rekognition/video/moderationTab.js';
import PersonTab from './analysis/rekognition/video/personTab.js';
import SegmentTab from './analysis/rekognition/video/segmentTab.js';
import TextTab from './analysis/rekognition/video/textTab.js';
/* rekog image */
import ImageCaptionTab from './analysis/rekognition/image/imageCaption.js';
import CelebImageTab from './analysis/rekognition/image/celebImageTab.js';
import LabelImageTab from './analysis/rekognition/image/labelImageTab.js';
import FaceMatchImageTab from './analysis/rekognition/image/faceMatchImageTab.js';
import FaceImageTab from './analysis/rekognition/image/faceImageTab.js';
import ModerationImageTab from './analysis/rekognition/image/moderationImageTab.js';
import TextImageTab from './analysis/rekognition/image/textImageTab.js';
/* transcribe */
import TranscribeTab from './analysis/transcribe/transcribeTab.js';
/* comprehend */
import KeyphraseTab from './analysis/comprehend/keyphraseTab.js';
import EntityTab from './analysis/comprehend/entityTab.js';
import SentimentTab from './analysis/comprehend/sentimentTab.js';
/* textract */
import TextractTab from './analysis/textract/textractTab.js';
/* custom labels */
import CustomLabelTab from './analysis/rekognition/video/customLabelTab.js';
/* search result */
import SearchResultTab from './analysis/searchResult/searchResultTab.js';
/* ReAnalyze */
import ReAnalyzeTab from './analysis/reAnalyze/reAnalzeTab.js';
/* knowledge graph */
import KnowledgeGraphTab from './analysis/knowledgeGraph/knowledgeGraphTab.js';

const {
  Rekognition: {
    Celeb,
    Label,
    FaceMatch,
    Face,
    Person,
    Moderation,
    Segment,
    CustomLabel,
    Text,
  },
  Comprehend: {
    Keyphrase,
    Entity,
    Sentiment,
  },
} = AnalysisTypes;

export default class AnalysisComponent {
  constructor(previewComponent) {
    this.$tabControllers = [];

    if (previewComponent.searchResults) {
      this.$tabControllers.push(new SearchResultTab(previewComponent));
    }
    this.$tabControllers.push(new StatisticsTab(previewComponent));

    if (KnowledgeGraphTab.canSupport()) {
      this.$tabControllers.push(new KnowledgeGraphTab(previewComponent));
    }

    if (previewComponent.media.getTranscribeResults()) {
      this.$tabControllers.push(new TranscribeTab(previewComponent));
    }

    const rekog = previewComponent.media.getRekognitionResults();
    let types = Object.keys(rekog || {});
    types.forEach((type) => {
      const datas = [].concat(rekog[type]);
      datas.forEach((data) => {
        let controller;
        if (type === Celeb) {
          controller = new CelebTab(previewComponent, data);
        } else if (type === Label) {
          controller = new LabelTab(previewComponent, data);
        } else if (type === FaceMatch) {
          controller = new FaceMatchTab(previewComponent, data);
        } else if (type === Face) {
          controller = new FaceTab(previewComponent, data);
        } else if (type === Person) {
          controller = new PersonTab(previewComponent, data);
        } else if (type === Moderation) {
          controller = new ModerationTab(previewComponent, data);
        } else if (type === Segment) {
          controller = new SegmentTab(previewComponent, data);
        } else if (type === CustomLabel) {
          controller = new CustomLabelTab(previewComponent, data);
        } else if (type === Text) {
          controller = new TextTab(previewComponent, data);
        }
        if (controller) {
          this.$tabControllers.push(controller);
        }
      });
    });

    /* BLIP model */
    const caption = previewComponent.media.getImageAutoCaptioning();
    if (caption) {
      this.$tabControllers.push(new ImageCaptionTab(previewComponent));
    }

    const rekogImage = previewComponent.media.getRekognitionImageResults();
    types = Object.keys(rekogImage || {});
    types.forEach((type) => {
      const datas = [].concat(rekogImage[type]);
      datas.forEach((data) => {
        let controller;
        if (type === Celeb) {
          controller = new CelebImageTab(previewComponent, data);
        } else if (type === Label) {
          controller = new LabelImageTab(previewComponent, data);
        } else if (type === FaceMatch) {
          controller = new FaceMatchImageTab(previewComponent, data);
        } else if (type === Face) {
          controller = new FaceImageTab(previewComponent, data);
        } else if (type === Text) {
          controller = new TextImageTab(previewComponent, data);
        } else if (type === Moderation) {
          controller = new ModerationImageTab(previewComponent, data);
        }
        if (controller) {
          this.$tabControllers.push(controller);
        }
      });
    });

    const comprehend = previewComponent.media.getComprehendResults();
    Object.keys(comprehend || {}).forEach((type) => {
      let controller;
      if (type === Keyphrase) {
        controller = new KeyphraseTab(previewComponent);
      } else if (type === Entity) {
        controller = new EntityTab(previewComponent);
      } else if (type === Sentiment) {
        controller = new SentimentTab(previewComponent);
      }
      if (controller) {
        this.$tabControllers.push(controller);
      }
    });

    const textract = previewComponent.media.getTextractResults();
    if (textract) {
      this.$tabControllers.push(new TextractTab(previewComponent));
    }
    /* permission */
    const session = GetUserSession();
    if (session.canWrite()) {
      this.$tabControllers.push(new ReAnalyzeTab(previewComponent));
    }
  }

  get previewComponent() {
    return this.$previewComponent;
  }

  get media() {
    return (this.$previewComponent || {}).media;
  }

  get tabControllers() {
    return this.$tabControllers;
  }

  set tabControllers(val) {
    this.$tabControllers = val;
  }

  async show() {
    let activeController = this.tabControllers
      .find((controller) =>
        controller.tabContent.hasClass('active'));

    if (!activeController) {
      activeController = this.tabControllers[0];
    }

    return activeController.show();
  }

  async hide() {
    return Promise.all(this.tabControllers.map(x => x.hide()));
  }

  createTabsAndContents() {
    const ul = $('<ul/>').addClass('nav flex-column ml-2 my-4 fs-default-menu')
      .attr('role', 'tablist');
    this.tabControllers.forEach(controller =>
      ul.append(controller.tabLink));
    const contents = this.tabControllers.map(controller =>
      controller.tabContent);
    return [
      ul,
      contents,
    ];
  }

  createContents() {
    const [
      tabs,
      contents,
    ] = this.createTabsAndContents();
    const menu = $('<nav/>').addClass('col-2 d-none sidebar')
      .css('min-height', 300)
      .append(tabs);
    const tabContents = $('<div/>').addClass('tab-content')
      .addClass('col-12 p-0 m-0')
      .append(contents);
    const container = $('<div/>').addClass('col-12 p-0 m-0')
      .append($('<div/>').addClass('row no-gutters')
        .append(menu)
        .append(tabContents));
    return container;
  }
}
