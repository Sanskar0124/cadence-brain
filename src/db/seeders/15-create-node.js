'use strict';

const { NODE_TYPES } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('node', [
      {
        node_id: 1,
        name: 'call',
        type: NODE_TYPES.CALL,
        is_first: true,
        step_number: 0,
        next_node_id: null,
        data: JSON.stringify({
          // * dummy data
          message: '',
        }),
        wait_time: 0,
        cadence_id: 0,
      },
      {
        node_id: 2,
        name: 'message',
        type: NODE_TYPES.MESSAGE,
        is_first: false,
        step_number: 0,
        next_node_id: null,
        data: JSON.stringify({
          // * dummy data
          message: 'Hi there!',
        }),
        wait_time: 0,
        cadence_id: 0,
      },
      {
        node_id: 3,
        name: 'mail',
        type: NODE_TYPES.MAIL,
        is_first: false,
        step_number: 0,
        next_node_id: null,
        data: JSON.stringify({
          // * dummy data
          subject: '',
          body: '',
          attachments: [],
        }),
        wait_time: 0,
        cadence_id: 0,
      },
      {
        node_id: 4,
        name: 'linkedin_connection',
        type: NODE_TYPES.LINKEDIN_CONNECTION,
        is_first: true,
        step_number: 0,
        next_node_id: null,
        data: JSON.stringify({
          // * dummy data
          script: 'Hello',
        }),
        wait_time: 0,
        cadence_id: 0,
      },
      {
        node_id: 5,
        name: 'Semi Automated Mail',
        type: NODE_TYPES.MAIL,
        is_first: true,
        step_number: 1,
        next_node_id: 6,
        data: JSON.stringify({
          // * dummy data
          subject: 'Test 1',
          body: 'Testing 1',
          attachments: [1, 2],
        }),
        wait_time: 300,
        cadence_id: 1,
      },
      {
        node_id: 6,
        name: 'Semi Automated Message',
        type: NODE_TYPES.MESSAGE,
        is_first: false,
        step_number: 2,
        next_node_id: 7,
        data: JSON.stringify({
          // * dummy data
          message: 'Hi there!',
        }),
        wait_time: 240,
        cadence_id: 1,
      },
      {
        node_id: 7,
        name: 'Automated Mail',
        type: NODE_TYPES.AUTOMATED_MAIL,
        is_first: false,
        step_number: 3,
        next_node_id: null,
        data: JSON.stringify({
          // * dummy data
          script: 'Hello',
        }),
        wait_time: 0,
        cadence_id: 1,
      },
      {
        node_id: 8,
        name: 'Call',
        type: NODE_TYPES.CALL,
        is_first: true,
        step_number: 1,
        next_node_id: 9,
        data: JSON.stringify({
          // * dummy data
          script: 'Hello',
        }),
        wait_time: 180,
        cadence_id: 2,
      },
      {
        node_id: 9,
        name: 'Semi Automated Mail',
        type: NODE_TYPES.MAIL,
        is_first: false,
        step_number: 2,
        next_node_id: 10,
        data: JSON.stringify({
          // * dummy data
          subject: 'Test',
          body: 'Testing',
          attachments: [1, 2],
        }),
        wait_time: 180,
        cadence_id: 2,
      },
      {
        node_id: 10,
        name: 'Semi Automated Message',
        type: NODE_TYPES.MESSAGE,
        is_first: false,
        step_number: 3,
        next_node_id: 11,
        data: JSON.stringify({
          // * dummy data
          message: 'Hi there!',
        }),
        wait_time: 0,
        cadence_id: 2,
      },
      {
        node_id: 11,
        name: 'Automated Mail',
        type: NODE_TYPES.AUTOMATED_MAIL,
        is_first: false,
        step_number: 4,
        next_node_id: null,
        data: JSON.stringify([
          // * dummy data
          {
            subject: 'Test 1',
            body: 'Testing 1',
            attachments: [1],
          },
          {
            subject: 'Test 2',
            body: 'Testing 2',
            attachments: [1, 2],
          },
        ]),
        wait_time: 180,
        cadence_id: 2,
      },
      {
        node_id: 12,
        name: 'Call',
        type: NODE_TYPES.CALL,
        is_first: true,
        step_number: 1,
        next_node_id: 13,
        data: JSON.stringify({
          // * dummy data
          script: 'Hello',
        }),
        wait_time: 180,
        cadence_id: 3,
      },
      {
        node_id: 13,
        name: 'Semi Automated Mail',
        type: NODE_TYPES.MAIL,
        is_first: false,
        step_number: 2,
        next_node_id: 14,
        data: JSON.stringify({
          // * dummy data
          subject: 'Test',
          body: 'Testing',
          attachments: [1, 2],
        }),
        wait_time: 60,
        cadence_id: 3,
      },
      {
        node_id: 14,
        name: 'Semi Automated Message',
        type: NODE_TYPES.MESSAGE,
        is_first: false,
        step_number: 3,
        next_node_id: 15,
        data: JSON.stringify({
          // * dummy data
          message: 'Hi there!',
        }),
        wait_time: 0,
        cadence_id: 3,
      },
      {
        node_id: 15,
        name: 'Automated Mail',
        type: NODE_TYPES.AUTOMATED_MAIL,
        is_first: false,
        step_number: 4,
        next_node_id: null,
        data: JSON.stringify([
          // * dummy data
          {
            subject: 'Test 1',
            body: 'Testing 1',
            attachments: [1],
          },
          {
            subject: 'Test 2',
            body: 'Testing 2',
            attachments: [1, 2],
          },
        ]),
        wait_time: 0,
        cadence_id: 3,
      },
      {
        node_id: 16,
        name: 'Call',
        type: NODE_TYPES.CALL,
        is_first: true,
        step_number: 1,
        next_node_id: 17,
        data: JSON.stringify({
          // * dummy data
          script: 'Hello',
        }),
        wait_time: 60,
        cadence_id: 4,
      },
      {
        node_id: 17,
        name: 'Semi Automated Mail',
        type: NODE_TYPES.MAIL,
        is_first: false,
        step_number: 2,
        next_node_id: 18,
        data: JSON.stringify({
          // * dummy data
          subject: 'Test',
          body: 'Testing',
          attachments: [1, 2],
        }),
        wait_time: 60,
        cadence_id: 4,
      },
      {
        node_id: 18,
        name: 'Semi Automated Message',
        type: NODE_TYPES.MESSAGE,
        is_first: false,
        step_number: 3,
        next_node_id: 19,
        data: JSON.stringify({
          // * dummy data
          message: 'Hi there!',
        }),
        wait_time: 0,
        cadence_id: 4,
      },
      {
        node_id: 19,
        name: 'Automated Mail',
        type: NODE_TYPES.AUTOMATED_MAIL,
        is_first: false,
        step_number: 4,
        next_node_id: null,
        data: JSON.stringify([
          // * dummy data
          {
            subject: 'Test 1',
            body: 'Testing 1',
            attachments: [1],
          },
          {
            subject: 'Test 2',
            body: 'Testing 2',
            attachments: [1, 2],
          },
        ]),
        wait_time: 0,
        cadence_id: 4,
      },
      {
        node_id: 20,
        name: 'Call',
        type: NODE_TYPES.CALL,
        is_first: true,
        step_number: 1,
        next_node_id: 21,
        data: JSON.stringify({
          // * dummy data
          script: 'Hello',
        }),
        wait_time: 60,
        cadence_id: 5,
      },
      {
        node_id: 21,
        name: 'Semi Automated Mail',
        type: NODE_TYPES.MAIL,
        is_first: false,
        step_number: 2,
        next_node_id: 22,
        data: JSON.stringify({
          // * dummy data
          subject: 'Test',
          body: 'Testing',
          attachments: [1, 2],
        }),
        wait_time: 60,
        cadence_id: 5,
      },
      {
        node_id: 22,
        name: 'Semi Automated Message',
        type: NODE_TYPES.MESSAGE,
        is_first: false,
        step_number: 3,
        next_node_id: 23,
        data: JSON.stringify({
          // * dummy data
          message: 'Hi there!',
        }),
        wait_time: 0,
        cadence_id: 5,
      },
      {
        node_id: 23,
        name: 'Automated Mail',
        type: NODE_TYPES.AUTOMATED_MAIL,
        is_first: false,
        step_number: 4,
        next_node_id: null,
        data: JSON.stringify([
          // * dummy data
          {
            subject: 'Test 1',
            body: 'Testing 1',
            attachments: [1],
          },
          {
            subject: 'Test 2',
            body: 'Testing 2',
            attachments: [1, 2],
          },
        ]),
        wait_time: 0,
        cadence_id: 5,
      },
      {
        node_id: 24,
        name: 'Call',
        type: NODE_TYPES.CALL,
        is_first: true,
        step_number: 1,
        next_node_id: 25,
        data: JSON.stringify({
          // * dummy data
          script: 'Hello',
        }),
        wait_time: 60,
        cadence_id: 6,
      },
      {
        node_id: 25,
        name: 'Semi Automated Mail',
        type: NODE_TYPES.MAIL,
        is_first: false,
        step_number: 2,
        next_node_id: 26,
        data: JSON.stringify({
          // * dummy data
          subject: 'Test',
          body: 'Testing',
          attachments: [1, 2],
        }),
        wait_time: 60,
        cadence_id: 6,
      },
      {
        node_id: 26,
        name: 'Semi Automated Message',
        type: NODE_TYPES.MESSAGE,
        is_first: false,
        step_number: 3,
        next_node_id: 27,
        data: JSON.stringify({
          // * dummy data
          message: 'Hi there!',
        }),
        wait_time: 0,
        cadence_id: 6,
      },
      {
        node_id: 27,
        name: 'Automated Mail',
        type: NODE_TYPES.AUTOMATED_MAIL,
        is_first: false,
        step_number: 4,
        next_node_id: null,
        data: JSON.stringify([
          // * dummy data
          {
            subject: 'Test 1',
            body: 'Testing 1',
            attachments: [1],
          },
          {
            subject: 'Test 2',
            body: 'Testing 2',
            attachments: [1, 2],
          },
        ]),
        wait_time: 0,
        cadence_id: 6,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('node', null, {});
  },
};
