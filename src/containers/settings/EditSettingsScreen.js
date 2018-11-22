import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import AppStore from '../../stores/AppStore';
import SettingsStore from '../../stores/SettingsStore';
import UserStore from '../../stores/UserStore';
import Form from '../../lib/Form';
import { APP_LOCALES } from '../../i18n/languages';
import { gaPage } from '../../lib/analytics';
import { DEFAULT_APP_SETTINGS } from '../../config';


import EditSettingsForm from '../../components/settings/settings/EditSettingsForm';

const messages = defineMessages({
  autoLaunchOnStart: {
    id: 'settings.app.form.autoLaunchOnStart',
    defaultMessage: '!!!Launch Franz on start',
  },
  autoLaunchInBackground: {
    id: 'settings.app.form.autoLaunchInBackground',
    defaultMessage: '!!!Open in background',
  },
  runInBackground: {
    id: 'settings.app.form.runInBackground',
    defaultMessage: '!!!Keep Franz in background when closing the window',
  },
  enableSystemTray: {
    id: 'settings.app.form.enableSystemTray',
    defaultMessage: '!!!Show Franz in system tray',
  },
  minimizeToSystemTray: {
    id: 'settings.app.form.minimizeToSystemTray',
    defaultMessage: '!!!Minimize Franz to system tray',
  },
  language: {
    id: 'settings.app.form.language',
    defaultMessage: '!!!Language',
  },
  darkMode: {
    id: 'settings.app.form.darkMode',
    defaultMessage: '!!!Dark Mode',
  },
  showDisabledServices: {
    id: 'settings.app.form.showDisabledServices',
    defaultMessage: '!!!Display disabled services tabs',
  },
  showMessageBadgeWhenMuted: {
    id: 'settings.app.form.showMessagesBadgesWhenMuted',
    defaultMessage: '!!!Show unread message badge when notifications are disabled',
  },
  enableSpellchecking: {
    id: 'settings.app.form.enableSpellchecking',
    defaultMessage: '!!!Enable spell checking',
  },
  enableGPUAcceleration: {
    id: 'settings.app.form.enableGPUAcceleration',
    defaultMessage: '!!!Enable GPU Acceleration',
  },
  spellcheckingLanguage: {
    id: 'settings.app.form.spellcheckingLanguage',
    defaultMessage: '!!!Language for spell checking',
  },
  beta: {
    id: 'settings.app.form.beta',
    defaultMessage: '!!!Include beta versions',
  },
});

export default @inject('stores', 'actions') @observer class EditSettingsScreen extends Component {
  static contextTypes = {
    intl: intlShape,
  };

  componentDidMount() {
    gaPage('Settings/App');
  }

  onSubmit(settingsData) {
    const { app, settings, user } = this.props.actions;

    app.launchOnStartup({
      enable: settingsData.autoLaunchOnStart,
      openInBackground: settingsData.autoLaunchInBackground,
    });

    settings.update({
      type: 'app',
      data: {
        runInBackground: settingsData.runInBackground,
        enableSystemTray: settingsData.enableSystemTray,
        minimizeToSystemTray: settingsData.minimizeToSystemTray,
        enableGPUAcceleration: settingsData.enableGPUAcceleration,
        showDisabledServices: settingsData.showDisabledServices,
        darkMode: settingsData.darkMode,
        showMessageBadgeWhenMuted: settingsData.showMessageBadgeWhenMuted,
        enableSpellchecking: settingsData.enableSpellchecking,
        beta: settingsData.beta, // we need this info in the main process as well
        locale: settingsData.locale, // we need this info in the main process as well
      },
    });

    user.update({
      userData: {
        beta: settingsData.beta,
        locale: settingsData.locale,
      },
    });
  }

  prepareForm() {
    const { app, settings, user } = this.props.stores;
    const { intl } = this.context;

    const locales = [];
    Object.keys(APP_LOCALES).sort(Intl.Collator().compare).forEach((key) => {
      locales.push({
        value: key,
        label: APP_LOCALES[key],
      });
    });

    const config = {
      fields: {
        autoLaunchOnStart: {
          label: intl.formatMessage(messages.autoLaunchOnStart),
          value: app.autoLaunchOnStart,
          default: DEFAULT_APP_SETTINGS.autoLaunchOnStart,
        },
        autoLaunchInBackground: {
          label: intl.formatMessage(messages.autoLaunchInBackground),
          value: app.launchInBackground,
          default: DEFAULT_APP_SETTINGS.autoLaunchInBackground,
        },
        runInBackground: {
          label: intl.formatMessage(messages.runInBackground),
          value: settings.all.app.runInBackground,
          default: DEFAULT_APP_SETTINGS.runInBackground,
        },
        enableSystemTray: {
          label: intl.formatMessage(messages.enableSystemTray),
          value: settings.all.app.enableSystemTray,
          default: DEFAULT_APP_SETTINGS.enableSystemTray,
        },
        minimizeToSystemTray: {
          label: intl.formatMessage(messages.minimizeToSystemTray),
          value: settings.all.app.minimizeToSystemTray,
          default: DEFAULT_APP_SETTINGS.minimizeToSystemTray,
        },
        showDisabledServices: {
          label: intl.formatMessage(messages.showDisabledServices),
          value: settings.all.app.showDisabledServices,
          default: DEFAULT_APP_SETTINGS.showDisabledServices,
        },
        showMessageBadgeWhenMuted: {
          label: intl.formatMessage(messages.showMessageBadgeWhenMuted),
          value: settings.all.app.showMessageBadgeWhenMuted,
          default: DEFAULT_APP_SETTINGS.showMessageBadgeWhenMuted,
        },
        enableSpellchecking: {
          label: intl.formatMessage(messages.enableSpellchecking),
          value: settings.all.app.enableSpellchecking,
          default: DEFAULT_APP_SETTINGS.enableSpellchecking,
        },
        darkMode: {
          label: intl.formatMessage(messages.darkMode),
          value: settings.all.app.darkMode,
          default: DEFAULT_APP_SETTINGS.darkMode,
        },
        enableGPUAcceleration: {
          label: intl.formatMessage(messages.enableGPUAcceleration),
          value: settings.all.app.enableGPUAcceleration,
          default: DEFAULT_APP_SETTINGS.enableGPUAcceleration,
        },
        locale: {
          label: intl.formatMessage(messages.language),
          value: app.locale,
          options: locales,
          default: DEFAULT_APP_SETTINGS.locale,
        },
        beta: {
          label: intl.formatMessage(messages.beta),
          value: user.data.beta,
          default: DEFAULT_APP_SETTINGS.beta,
        },
      },
    };

    return new Form(config);
  }

  render() {
    const {
      updateStatus,
      cacheSize,
      updateStatusTypes,
      isClearingAllCache,
    } = this.props.stores.app;
    const {
      checkForUpdates,
      installUpdate,
      clearAllCache,
    } = this.props.actions.app;
    const form = this.prepareForm();

    return (
      <EditSettingsForm
        form={form}
        checkForUpdates={checkForUpdates}
        installUpdate={installUpdate}
        isCheckingForUpdates={updateStatus === updateStatusTypes.CHECKING}
        isUpdateAvailable={updateStatus === updateStatusTypes.AVAILABLE}
        noUpdateAvailable={updateStatus === updateStatusTypes.NOT_AVAILABLE}
        updateIsReadyToInstall={updateStatus === updateStatusTypes.DOWNLOADED}
        onSubmit={d => this.onSubmit(d)}
        cacheSize={cacheSize}
        isClearingAllCache={isClearingAllCache}
        onClearAllCache={clearAllCache}
      />
    );
  }
}

EditSettingsScreen.wrappedComponent.propTypes = {
  stores: PropTypes.shape({
    app: PropTypes.instanceOf(AppStore).isRequired,
    user: PropTypes.instanceOf(UserStore).isRequired,
    settings: PropTypes.instanceOf(SettingsStore).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    app: PropTypes.shape({
      launchOnStartup: PropTypes.func.isRequired,
      checkForUpdates: PropTypes.func.isRequired,
      installUpdate: PropTypes.func.isRequired,
      clearAllCache: PropTypes.func.isRequired,
    }).isRequired,
    settings: PropTypes.shape({
      update: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.shape({
      update: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};
