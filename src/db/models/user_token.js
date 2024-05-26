'use strict';
// Packages
const { Model } = require('sequelize');

// Helpers and Services
const CryptoHelper = require('../../helper/crypto');

module.exports = (sequelize, Sequelize) => {
  class User_Token extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  User_Token.init(
    {
      user_token_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      is_google_token_expired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // * ringover keys/tokens
      encrypted_ringover_api_key: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      ringover_api_key: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedRingoverApiKey, errForDecryptedRingoverApiKey] =
            CryptoHelper.decrypt(this.encrypted_ringover_api_key);

          if (!errForDecryptedRingoverApiKey) return decryptedRingoverApiKey;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `ringover api key` value!');
        },
      },
      // * google keys/tokens
      encrypted_google_refresh_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      google_token_expiration: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0,
      },

      google_refresh_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedGoogleRefreshToken,
            errForDecryptedGoogleRefreshToken,
          ] = CryptoHelper.decrypt(this.encrypted_google_refresh_token);

          if (!errForDecryptedGoogleRefreshToken)
            return decryptedGoogleRefreshToken;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `google refresh token` value!'
          );
        },
      },
      encrypted_google_mail_last_history_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      google_mail_last_history_id: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedGoogleMailLastHistoryId,
            errForDecryptedGoogleMailLastHistoryId,
          ] = CryptoHelper.decrypt(this.encrypted_google_mail_last_history_id);

          if (!errForDecryptedGoogleMailLastHistoryId)
            return decryptedGoogleMailLastHistoryId;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `google mail last history id` value!'
          );
        },
      },
      encrypted_google_calendar_sync_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      google_calendar_sync_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedGoogleCalendarSyncToken,
            errForDecryptedGoogleCalendarSyncToken,
          ] = CryptoHelper.decrypt(this.encrypted_google_calendar_sync_token);

          if (!errForDecryptedGoogleCalendarSyncToken)
            return decryptedGoogleCalendarSyncToken;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `google calendar sync token` value!'
          );
        },
      },
      encrypted_google_calendar_channel_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      google_calendar_channel_id: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedGoogleCalendarChannelId,
            errForDecryptedGoogleCalendarChannelId,
          ] = CryptoHelper.decrypt(this.encrypted_google_calendar_channel_id);

          if (!errForDecryptedGoogleCalendarChannelId)
            return decryptedGoogleCalendarChannelId;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `google calendar channel id` value!'
          );
        },
      },
      is_salesforce_logged_out: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      encrypted_salesforce_instance_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesforce_instance_url: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedSalesforceInstanceUrl,
            errForDecryptedSalesforceInstanceUrl,
          ] = CryptoHelper.decrypt(this.encrypted_salesforce_instance_url);

          if (!errForDecryptedSalesforceInstanceUrl)
            return decryptedSalesforceInstanceUrl;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `salesforce instance url` value!'
          );
        },
      },
      encrypted_salesforce_access_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesforce_access_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedSalesforceAccessToken,
            errForDecryptedSalesforceAccessToken,
          ] = CryptoHelper.decrypt(this.encrypted_salesforce_access_token);

          if (!errForDecryptedSalesforceAccessToken)
            return decryptedSalesforceAccessToken;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `salesforce access token` value!'
          );
        },
      },
      encrypted_salesforce_refresh_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesforce_refresh_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedSalesforceRefreshToken,
            errForDecryptedSalesforceRefreshToken,
          ] = CryptoHelper.decrypt(this.encrypted_salesforce_refresh_token);

          if (!errForDecryptedSalesforceRefreshToken)
            return decryptedSalesforceRefreshToken;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `salesforce refresh token` value!'
          );
        },
      },
      is_outlook_token_expired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      encrypted_outlook_refresh_token: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      outlook_refresh_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedOutlookRefreshToken,
            errForDecryptedOutlookRefreshToken,
          ] = CryptoHelper.decrypt(this.encrypted_outlook_refresh_token);

          if (!errForDecryptedOutlookRefreshToken)
            return decryptedOutlookRefreshToken;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `outlook_refresh_token` value!'
          );
        },
      },
      encrypted_linkedin_cookie: {
        type: Sequelize.STRING(3000),
        allowNull: true,
      },
      linkedin_cookie: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedLinkedinCookie, errForDecryptedLinkedinCookie] =
            CryptoHelper.decrypt(this.encrypted_linkedin_cookie);

          if (!errForDecryptedLinkedinCookie) return decryptedLinkedinCookie;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `linkedin_cookie` value!');
        },
      },
      outlook_mail_inbox_subscription_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      outlook_mail_outbox_subscription_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      outlook_calendar_subscription_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_service_enabled: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      kaspr_service_enabled: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      hunter_service_enabled: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      dropcontact_service_enabled: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      snov_service_enabled: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      encrypted_calendly_access_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      calendly_access_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedCalendlyAccessToken,
            errForDecryptedCalendlyAccessToken,
          ] = CryptoHelper.decrypt(this.encrypted_calendly_access_token);

          if (!errForDecryptedCalendlyAccessToken)
            return decryptedCalendlyAccessToken;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `calendly access token` value!'
          );
        },
      },
      encrypted_calendly_refresh_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      calendly_refresh_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [
            decryptedCalendlyRefreshToken,
            errForDecryptedCalendlyRefreshToken,
          ] = CryptoHelper.decrypt(this.encrypted_calendly_refresh_token);

          if (!errForDecryptedCalendlyRefreshToken)
            return decryptedCalendlyRefreshToken;

          return '';
        },
        set() {
          throw new Error(
            'Do not try to set the `calendly refresh token` value!'
          );
        },
      },
      encrypted_calendly_user_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      calendly_user_id: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedCalendlyUserId, errForDecryptedCalendlyUserId] =
            CryptoHelper.decrypt(this.encrypted_calendly_user_id);

          if (!errForDecryptedCalendlyUserId) return decryptedCalendlyUserId;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `calendly user id` value!');
        },
      },
      encrypted_calendly_webhook_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      calendly_webhook_id: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedCalendlyWebhookId, errForDecryptedCalendlyWebhookId] =
            CryptoHelper.decrypt(this.encrypted_calendly_webhook_id);

          if (!errForDecryptedCalendlyWebhookId)
            return decryptedCalendlyWebhookId;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `calendly webhook id` value!');
        },
      },
      onboarding_mail_message_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      onboarding_mail_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      extension_version: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'user_token',
      modelName: 'User_Token',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return User_Token;
};
