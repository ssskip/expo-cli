import _ from 'lodash';

import BaseUploader from './BaseUploader';
import log from '../log';
import prompt from '../../prompt';

const PLATFORM = 'ios';

const APPLE_CREDS_QUESTIONS = [
  {
    type: 'input',
    name: 'appleId',
    message: `What's your Apple ID?`,
  },
  {
    type: 'password',
    name: 'appleIdPassword',
    message: 'Password?',
  },
];

const APP_NAME_TOO_LONG_MSG = `An app name can't be longer than 30 characters.`;
const APP_NAME_QUESTION = {
  type: 'input',
  name: 'appName',
  message: 'How would you like to name your app?',
  validate: appName => {
    if (!appName) {
      return 'Empty app name is not valid.';
    } else if (appName.length > 30) {
      return APP_NAME_TOO_LONG_MSG;
    } else {
      return true;
    }
  },
};

export default class IOSUploader extends BaseUploader {
  constructor(projectDir, options) {
    super(PLATFORM, projectDir, options);
  }

  _ensureExperienceIsValid(exp) {
    if (!_.has(exp, 'ios.bundleIdentifier')) {
      throw new Error(`You must specify an iOS bundle identifier in app.json.`);
    }
  }

  async _getPlatformSpecificOptions() {
    const appleIdCrentials = await this._getAppleIdCredentials();
    const appName = await this._getAppName();
    const otherOptions = _.pick(this.options, ['language', 'sku']);
    return {
      ...appleIdCrentials,
      appName,
      ...otherOptions,
    };
  }

  async _getAppleIdCredentials() {
    const appleCredsKeys = ['appleId', 'appleIdPassword'];
    const result = _.pick(this.options, appleCredsKeys);

    if (process.env.EXPO_APPLE_ID) {
      result.appleId = process.env.EXPO_APPLE_ID;
    }
    if (process.env.EXPO_APPLE_ID_PASSWORD) {
      result.appleIdPassword = process.env.EXPO_APPLE_ID_PASSWORD;
    }

    const credsPresent = _.intersection(Object.keys(result), appleCredsKeys);
    if (credsPresent.length !== appleCredsKeys.length) {
      const questions = APPLE_CREDS_QUESTIONS.filter(({ name }) => !credsPresent.includes(name));
      const answers = await prompt(questions);
      return { ...result, answers };
    } else {
      return result;
    }
  }

  async _getAppName() {
    const appName = this.options.appName || this._exp.name;
    if (!appName || appName.length > 30) {
      if (appName.length > 30) {
        log.error(APP_NAME_TOO_LONG_MSG);
      }
      return await this._askForAppName();
    } else {
      return appName;
    }
  }

  async _askForAppName() {
    const { appName } = await prompt(APP_NAME_QUESTION);
    return appName;
  }

  async _uploadToTheStore(platformData, buildPath) {
    console.log(this.options);
    console.log(platformData);
    console.log(buildPath);
    // const { name: appName, ios: { bundleIdentifier } } = this.options;
    // const { fastlane } = this;
    // console.log([bundleIdentifier, appName, appleId]);
    // const login = await spawnAndCollectJSONOutputAsync(fastlane.app_produce, [
    //   bundleIdentifier,
    //   appName,
    //   appleId,
    // ]);
    // if (login.result !== 'success') {
    //   printFastlaneError(login, 'login');
    //   return;
    // }
    // const upload = await spawnAndCollectJSONOutputAsync(fastlane.app_deliver, [path, appleId]);
    // if (upload.result !== 'success') {
    //   printFastlaneError(upload, 'upload');
    // }
  }
}
