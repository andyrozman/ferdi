import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

import AuthLayout from '../../components/auth/AuthLayout';
import AppStore from '../../stores/AppStore';
import GlobalErrorStore from '../../stores/GlobalErrorStore';
import AppLoader from '../../components/ui/AppLoader';

import { oneOrManyChildElements } from '../../prop-types';

export default @inject('stores', 'actions') @observer class AuthLayoutContainer extends Component {
  static propTypes = {
    children: oneOrManyChildElements.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const { stores, actions, children, location } = this.props;
    const { app, features, globalError } = stores;

    const isLoadingBaseFeatures = features.defaultFeaturesRequest.isExecuting
      && !features.defaultFeaturesRequest.wasExecuted;

    if (isLoadingBaseFeatures) {
      return (
        <AppLoader />
      );
    }

    return (
      <AuthLayout
        error={globalError.response}
        pathname={location.pathname}
        isOnline={app.isOnline}
        isAPIHealthy={!app.healthCheckRequest.isError}
        retryHealthCheck={actions.app.healthCheck}
        isHealthCheckLoading={app.healthCheckRequest.isExecuting}
        isFullScreen={app.isFullScreen}
        darkMode={app.isSystemDarkModeEnabled}
      >
        {children}
      </AuthLayout>
    );
  }
}

AuthLayoutContainer.wrappedComponent.propTypes = {
  stores: PropTypes.shape({
    app: PropTypes.instanceOf(AppStore).isRequired,
    globalError: PropTypes.instanceOf(GlobalErrorStore).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    app: PropTypes.shape({
      healthCheck: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};
