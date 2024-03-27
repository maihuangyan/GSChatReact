import moment from "moment";
import useJwt from "utils/jwt/useJwt"
import JwtService from "./jwt/jwtService";
var _ = require('lodash');


// ** Converts HTML to string
export const htmlToString = (html) => html.replace(/<\/?[^>]+(>|$)/g, "");

// ** Checks if the passed date is today
const isToday = (date) => {
  const today = new Date();
  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    /* eslint-enable */
  );
};

/**
 ** Format and return date in Humanize format
 ** Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 ** Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Object} formatting Intl object to format with
 */
export const formatDate = (
  value,
  formatting = { month: "short", day: "numeric", year: "numeric" }
) => {
  if (!value) return value;
  return new Intl.DateTimeFormat("en-US", formatting).format(new Date(value));
};

// ** Returns short month of passed date
export const formatDateToMonthShort = (
  milisecs,
  toTimeForCurrentDay = true
) => {
  const date = new Date(milisecs);
  let formatting = { month: "short", day: "numeric" };

  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: "numeric", minute: "numeric" };
  }

  return new Intl.DateTimeFormat("en-US", formatting).format(date);
};

function datediff(first, second) {
  // Take the difference between the dates and divide by milliseconds per day.
  // Round to nearest whole number to deal with DST.
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

export const formatChatTime = (milisecs) => {
  var t = new Date(milisecs);
  return moment(t).format("h:mm a");
};

export const formatChatDate = (milisecs) => {
  var fulldays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  var t = new Date(milisecs);
  var dt = t,
    date = dt.getDate(),
    month = months[dt.getMonth()],
    timeDiff = t - Date.now(),
    diffDays = new Date().getDate() - date,
    diffMonths = new Date().getMonth() - dt.getMonth(),
    diffYears = new Date().getFullYear() - dt.getFullYear();

  if (diffYears === 0 && diffDays === 0 && diffMonths === 0) {
    return "Today";
  } else if (diffYears === 0 && diffDays === 1) {
    return "Yesterday";
  } else if (diffYears === 0 && diffDays === -1) {
    return "Tomorrow";
  } else if (diffYears === 0 && diffDays < -1 && diffDays > -7) {
    return fulldays[dt.getDay()];
  } else if (diffYears >= 1) {
    return month + " " + date + ", " + new Date(milisecs).getFullYear();
  } else {
    return month + " " + date;
  }
};

export const randomString = (len = 50, charSet = "") => {
  charSet =
    charSet || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < len; i++) {
    let randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }

  return randomString + nowSecs();
};

export const nowSecs = () => {
  return Math.floor(Date.now());
};

export const sortMessages = (messages) => {
  return messages.sort((a, b) => {
    return a.created_at > b.created_at
  })
}

export const isMessageSeen = (message) => {
  const mUserId = useJwt.getUserID()
  if (message.user_id == mUserId) {
    return true;
  }

  if (!message.seens || message.seens.length == 0) {
    return false;
  }

  let seenStatus = false;
  for (let seen of message.seens) {
    if (seen.user_id == mUserId && seen.status == 1) {
      seenStatus = true;
      break;
    }
  }

  return seenStatus;
}

export const isMessageSeenByOther = (message, room) => {
  if (!message || message.id == 0) return false;

  if (!room || !room.room_users || room.room_users.length == 0) return false;
  // console.log(message, room)
  for (let i = 0; i < room.room_users.length; i++) {
    const room_user = room.room_users[i];
    if (room_user.user_id != useJwt.getUserID()) {
      if (room_user.seen_message_id >= message.id) return true;
    }
  }

  return false;
}

export const getSeenStatus = (message, room) => {
  if (!message.id) {
    return 'Sending... ';
  }

  if (message.created_at != message.updated_at) {
    return 'Edited, ';
  }

  if (isMessageSeenByOther(message, room)) {
    return 'Seen, ';
  }
  return 'Sent, ';
}

export const isEmpty = (value) => {
  if (!value) {
    return true;
  }
  value = ('' + value).replace(/\r?\n|\r/g, '').replace(' ', '')
  if (value) {
    return false
  }
  return true
}

export const getUserDisplayName = (user) => {
  if (!user) {
    return "Unkown User";
  }

  if (typeof user === 'object') {
    if (!isEmpty(user.full_name)) {
      return user.full_name;
    }
    if (!isEmpty(user.first_name) && !isEmpty(user.last_name)) {
      return user.first_name + ' ' + user.last_name
    }
    if (!isEmpty(user.first_name)) {
      return user.first_name
    }
    if (!isEmpty(user.last_name)) {
      return user.last_name
    }
    if (!isEmpty(user.username)) {
      return user.username
    }
  }

  return "Unkown User";
}

export const getRoomDisplayName = (room) => {
  // console.log(room)
  if (!room) {
    return "Unkown Room";
  }

  if (typeof room === 'object') {
    if (room.group == 1) {
      return room.name;
    }
    if (!room.opponents || !Array.isArray(room.opponents) || room.opponents.length == 0) {
      return room.name;
    }

    for (let user of room.opponents) {
      if (user.id != useJwt.getUserID()) {
        return getUserDisplayName(user);
      }
    }
  }

  return "Unkown Room";
}

export const AdaptiveImage = (imgInfo) => {
  let { imgW, imgH } = imgInfo;
  console.log(imgW,imgH)

  let maxW;
  document.onresize = (e) => {
    // console.log(e.target.innerWidth)
    e.target.innerWidth < 750 ? maxW = 200 : maxW = 450
  }

  if (imgW < maxW) {
    return {
      viewWidth: imgW,
      viewHeight: imgH,
    }
  } else if (imgW > maxW) {
    let ratio = Number((maxW / imgW).toFixed(2));
    return {
      viewWidth: maxW,
      viewHeight: imgH * ratio,
    }
  }
}

