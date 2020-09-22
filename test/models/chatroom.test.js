const Room = require('../../models/chatroom');
const User = require('../../models/user');
const Message = require('../../models/message');

let defaultUser = {};
let defaultChatroom = {};

beforeEach(() => {
  defaultUser = new User({
    username: 'UnitTestUser',
    email: 'UnitTestUser@mvkitech.com',
    password: 'UnitTest',
  });

  defaultChatroom = new Room({
    name: 'unitTestChatroom',
    topic: 'unitTestTopic',
    createdBy: defaultUser,
    subscribers: [],
    messages: [],
  });
});

afterEach(() => {
  defaultUser = {};
  defaultChatroom = {};
});

test('isUserSubscribed_whenNoSubscriptionsExist_returnsUndefined', () => {
  let result = defaultChatroom.subscribers;
  expect(result.length).toEqual(0);
  result = defaultChatroom.isUserSubscribed(defaultUser);
  expect(result).toBe(undefined);
});

test('isUserSubscribed_whenDifferentSubscriptionExist_returnsUndefined', () => {
  let result = defaultChatroom.subscribers;
  expect(result.length).toEqual(0);
  const otherUser = new User({
    username: 'otherUser',
    email: 'otherUser@mvkitech.com',
    password: 'otherTest',
  });
  defaultChatroom.addSubscription(otherUser);
  result = defaultChatroom.subscribers;
  expect(result.length).toEqual(1);
  result = defaultChatroom.isUserSubscribed(defaultUser);
  expect(result).toBe(undefined);
});

test('isUserSubscribed_whenSameSubscriptionExist_returnsNotNull', () => {
  let result = defaultChatroom.subscribers;
  expect(result.length).toEqual(0);
  defaultChatroom.addSubscription(defaultUser);
  result = defaultChatroom.subscribers;
  expect(result.length).toEqual(1);
  result = defaultChatroom.isUserSubscribed(defaultUser);
  expect(result).not.toBeNull();
});

test('isUserSubscribed_whenSubscriptionAddedAndRemoved_returnsUndefined', () => {
  let result = defaultChatroom.subscribers;
  expect(result.length).toEqual(0);
  defaultChatroom.addSubscription(defaultUser);
  result = defaultChatroom.subscribers;
  expect(result.length).toEqual(1);
  result = defaultChatroom.isUserSubscribed(defaultUser);
  expect(result).not.toBeNull();
  defaultChatroom.removeSubscription(defaultUser);
  result = defaultChatroom.isUserSubscribed(defaultUser);
  expect(result).toBe(undefined);
});

test('addMessage_whenMessageIsAdded_returnsOneItemInArray', () => {
  let result = defaultChatroom.messages;
  expect(result.length).toEqual(0);
  const message = new Message({
    roomId: defaultChatroom,
    userId: defaultUser,
    username: defaultUser.username,
    content: 'Unit Test Message',
    sentOn: new Date().getTime(),
  });
  defaultChatroom.addMessage(message);
  result = defaultChatroom.messages;
  expect(result.length).toEqual(1);
});
