var base_url = 'http://app.seoulspa.vn';

chrome.runtime.onConnect.addListener(function (externalPort) {
  externalPort.onDisconnect.addListener(function () {
    console.log("onDisconnect")
    // Do stuff that should happen when popup window closes here
  })
  console.log("onConnect")
})

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == 'submitPhone') submitPhoneSV(request);

  if (request.type == 'getdetail') getCusDetailSV(request);

  if (request.type == 'sendAndClear') sendAndClearData_bg();

  if (request.type == 'updateDataInbox') {
    sendResponse({ status: 1, message: "Call api update has oke" });
    updateDataInboxSV();
  }
  if (request.type == 'getGroupServices') { getGroupService_bg(request.phone); }

  if (request.type == 'login') login(request.phone, request.password);

  if (request.type == 'key') {

    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;

    let data = {
      "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
      "user_id": request.user_id,
      "cus_code": request.customer,
      "cus_name": request.cus_name,
      "conversation_code": request.conversation,
      "time": time,
      "created_date": date
    }

    if (request.phone && request.user_id) {
      //check user has inbox
      let index = request.inboxUserData.findIndex(e => {
        return e.inbox_id == request.conversation && e.user_id == request.user_id;
      });



      if (index >= 0) {
        sendResponse({ status: 1, message: "Đã nhắn tin với user này!" });
        request.inboxUserData[index].time = dateTime;
        request.inboxUserData[index].created_date = date;
        chrome.storage.sync.set({ inboxUserData: request.inboxUserData }, function () { });

      } else {
        request.inboxUserData.push({ inbox_id: request.conversation, user_id: request.user_id, time: dateTime, created_date: date });

        chrome.storage.sync.set({ inboxUserData: request.inboxUserData }, function () { });
        base_url = request.phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
        fetch(base_url + '/api/index.php/pancake/api_update_detail_converesation', {
          method: 'post',
          body: JSON.stringify([data])
        }).then(r => {
          r.json().then(function (data) {
            console.log(data);
          })
        })
        sendResponse({ status: 1, message: "Thêm thành công cuộc trò chuyện!" });
      }
    } else {
      sendResponse({ status: 0, message: "Bạn chưa đăng nhập vào tiện ích của SeoulSpa!" });
    }

  }
});

function sendMessageToContent(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data, function (response) { });
  });
}

function getGroupService_bg(phone) {
  if (phone) {
    base_url = phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
    var arrSend = {
      "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
    }
    chrome.storage.sync.set({ 'groupService': { data: [] } }, function () { });

    fetch(base_url + '/api/index.php/pancake/GetGroupServices', {
      method: 'post',
      body: JSON.stringify(arrSend)
    }).then(r => {
      r.json().then(function (data) {
        if (data && data.status == 1) {
          chrome.storage.sync.set({ 'groupService': data }, function () { });
          data.type = 'groupService';
          sendMessageToContent(data);
        } else {
          chrome.storage.sync.set({ 'groupService': { data: [] } }, function () { });
        }
      })
    })
  }
}

function sendAndClearData_bg() {
  chrome.storage.sync.get(['inboxUserData'], function (result) {
    result.inboxUserData.forEach(element => {
      element.api_key = '1DB185DCFB40836B29BFC1A500E3EB';
      element.user_id = element.user_id;
      element.conversation_code = element.inbox_id;
      element.latest_update = element.time;
    });
    if (result.inboxUserData.length > 0) {
      based_url = phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
      fetch(based_url + '/api/index.php/pancake/api_update_detail_converesation', {
        method: 'post',
        body: JSON.stringify(result.inboxUserData)
      }).then(r => {
        r.json().then(function (data) { console.log(data); })
      })
    }
    chrome.storage.sync.set({ 'inboxUserData': [], 'last_update_inbox': (new Date()).toISOString() }, function () { });
  })
}

function submitPhoneSV(request) {
  let today = new Date();
  let arrSend = {
    "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
    "user_id": request.user_id,
    "cus_code": request.customer,
    "cus_phone": request.customer_phone,
    "conversation_code": request.conversation,
    "group_service_id": request.service,
    "cus_name": request.cus_name,
    "created_date": today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
  }
  base_url = request.phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
  fetch(base_url + '/api/index.php/pancake/api_update_pancake_conversation', {
    method: 'post',
    body: JSON.stringify(arrSend)
  }).then(r => {
    r.json().then(function (data) {
      data.type = 'submitPhone';
      sendMessageToContent(data);
    })
  })
}

function getCusDetailSV(request) {
  let arrSend = {
    "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
    "cus_code": request.cus_code,
  }
  chrome.storage.sync.get(['phone'], function (result) {

    base_url = result.phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';

    fetch(base_url + '/api/index.php/pancake/GetCustomerInfor', {
      method: 'post',
      body: JSON.stringify(arrSend)
    }).then(r => {
      r.json().then(function (data) {
        data.type = "getdetail";
        sendMessageToContent(data);
      })
    })
  })
}

function updateDataInboxSV(request) {
  chrome.storage.sync.get(['inboxUserData', 'phone'], function (result) {
    if (result && result.inboxUserData.length > 0) {
      result.inboxUserData.forEach(element => {
        element.api_key = '1DB185DCFB40836B29BFC1A500E3EB';
        element.conversation_code = element.inbox_id;
        element.latest_update = element.time;
      });

      var based_url = result.phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
      fetch(based_url + '/api/index.php/pancake/api_update_detail_converesation', {
        method: 'post',
        body: JSON.stringify(result.inboxUserData)
      }).then(r => {
        chrome.storage.sync.set({ 'inboxUserData': [], 'last_update_inbox': (new Date()).toISOString() }, function () { });
      })
    }
  })
}
function login(phone, pass) {
  let base_url = phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
  if (phone == '000' && pass == '123') {
    let data = {
      message: 'Login thành công vào dev',
      status: 200,
      type: 'login',
      user: {
        id: 1323,
        phone: '000',
        first_name: 'Dev ',
        last_name: 'Điểm nhấn '
      }
    }
    getGroupService_bg('000');
    sendMessageToContent(data);
  } else {
    var arrSend = {
      "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
      "identity": phone,
      "password": pass
    }
    fetch(base_url + '/api/index.php/user/login', {
      method: 'post',
      body: JSON.stringify(arrSend)
    }).then(r => {
      r.json().then(function (data) {
        data.type = 'login';
        sendMessageToContent(data);
        getGroupService_bg(data.user.phone);
      })
    })
  }
}


