// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Localization from '../../../shared/localization.js';
import {
  GetS3Utils,
} from '../../../shared/s3utils.js';
import mxReadable from '../../../mixins/mxReadable.js';
import {
  AWSConsoleS3,
  AWSConsoleStepFunctions,
} from '../../../shared/awsConsole.js';

const MSG_VIEW_ON_CONSOLE = Localization.Tooltips.ViewOnAWSConsole;
const MSG_DOWNLOAD_FILE = Localization.Tooltips.DownloadFile;
const CSS_DL = 'row text-left lead-xs ml-2 mb-2';
const CSS_DT = 'col-sm-2';
const CSS_DD = 'col-sm-10';

const DEFAULT_CSS = {
  dl: CSS_DL,
  dt: CSS_DT,
  dd: CSS_DD,
};

export default class DescriptionList extends mxReadable(class {}) {
  constructor(cssOptions) {
    super();
    this.$cssOptions = {
      ...DEFAULT_CSS,
      ...cssOptions,
    };
  }

  get cssOptions() {
    return this.$cssOptions;
  }

  createTableList() {
    return $('<dl/>').addClass(this.cssOptions.dl);
  }

  createListTitle(title) {
    return $('<dt/>').addClass(this.cssOptions.dt)
      .addClass('text-capitalize text-truncate').append(title);
  }

  createListData(data) {
    const dd = $('<dd/>').addClass(this.cssOptions.dd);
    if (!Array.isArray(data)) {
      return dd.append(data);
    }
    data.forEach(x => dd.append(x));
    return dd;
  }

  appendTableList(dl, data, name) {
    return dl.append(this.createListTitle(name))
      .append(this.createListData(this.readableValue(data, name)));
  }

  createDetailGroup(name, indent = 0) {
    const css = (!indent)
      ? {
        margin: '',
        lead: 'lead-s',
      }
      : (indent === 1)
        ? {
          margin: 'ml-2',
          lead: 'lead-s',
        }
        : {
          margin: 'ml-4',
          lead: 'lead-s',
        };
    const details = $('<details/>').addClass(css.margin)
      .append($('<summary/>').addClass('my-2')
        .append($('<span/>').addClass(`${css.lead} text-capitalize`)
          .append(name)));
    return details;
  }

  readableValue(data, name) {
    if (name === 'key' && data.bucket) {
      const container = $('<div/>');
      const consoleLink = $('<a/>')
        .addClass('mr-1')
        .addClass('badge badge-pill badge-primary mr-1 mb-1 lead-xs')
        .attr('href', AWSConsoleS3.getLink(data.bucket, data.key))
        .attr('target', '_blank')
        .html(MSG_VIEW_ON_CONSOLE);
      container.append(consoleLink);

      const downloadLink = $('<a/>')
        .addClass('mr-1')
        .attr('download', '')
        .attr('target', '_blank')
        .attr('data-toggle', 'tooltip')
        .attr('data-placement', 'bottom')
        .attr('title', MSG_DOWNLOAD_FILE)
        .append(data.key)
        .tooltip({
          trigger: 'hover',
        });
      container.append(downloadLink);

      container.ready(async () => {
        const s3utils = GetS3Utils();
        const signed = await s3utils.signUrl(
          data.bucket,
          data.key
        );
        downloadLink.attr(
          'href',
          signed
        );
      });

      return container;
    }

    if (name === 'fileSize') {
      return DescriptionList.readableFileSize(data.fileSize);
    }
    if (name === 'duration') {
      return DescriptionList.readableDuration(data[name]);
    }
    if (name === 'timestamp' || name === 'lastModified' || name === 'startTime' || name === 'endTime') {
      return DescriptionList.isoDateTime(data[name]);
    }
    if (name === 'executionArn') {
      return $('<a/>').addClass('badge badge-pill badge-primary mr-1 mb-1 lead-xs')
        .attr('href', AWSConsoleStepFunctions.getExecutionLink(data[name]))
        .attr('target', '_blank')
        .attr('data-toggle', 'tooltip')
        .attr('data-placement', 'bottom')
        .attr('title', MSG_VIEW_ON_CONSOLE)
        .html(data[name].split(':').pop())
        .tooltip({
          trigger: 'hover',
        });
    }
    if (Array.isArray(data[name])) {
      return data[name].join(', ');
    }
    return data[name];
  }
}
