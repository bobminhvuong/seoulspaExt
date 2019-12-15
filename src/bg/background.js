
chrome.runtime.onConnect.addListener(function (externalPort) {
  externalPort.onDisconnect.addListener(function () {
    console.log("onDisconnect")
    // Do stuff that should happen when popup window closes here
  })
  console.log("onConnect")
})

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    let base_url = '';
    if (request.type == 'key') {
      let data = {
        "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
        "user_id": request.user_id,
        "cus_code": request.customer,
        "cus_name": request.cus_name,
        "conversation_code": request.conversation
      }

      if (request.phone && request.user_id) {

        //check user has inbox
        let index = request.inboxUserData.findIndex(e => {
          return e.inbox_id == request.conversation && e.user_id == request.user_id;
        });
        if (index >= 0) {
          sendResponse({ status: 1, message: "Đã nhắn tin với user này!" });
          //set user inbox to store
          var today = new Date();
          var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          var dateTime = date + ' ' + time;
          // request.inboxUserData.push({ inbox_id: request.conversation, user_id: request.user_id, time: dateTime });
          request.inboxUserData[index].time = dateTime;
          chrome.storage.sync.set({ inboxUserData: request.inboxUserData }, function () { });
        } else {
          var arrData = Array();
          arrData.push(data);
          console.log('data', JSON.stringify(arrData));
          request.inboxUserData.push({ inbox_id: request.conversation, user_id: request.user_id });
          chrome.storage.sync.set({ inboxUserData: request.inboxUserData }, function () { });
          base_url = request.phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
          fetch(base_url + '/api/index.php/pancake/api_update_detail_converesation', {
            method: 'post',
            body: JSON.stringify(arrData)
          }).then(r => {
          })
          sendResponse({ status: 1, message: "Thêm thành công cuộc trò chuyện!" });
        }
      } else {
        sendResponse({ status: 0, message: "Bạn chưa đăng nhập vào tiện ích của SeoulSpa!" });
      }

    } else if (request.type == 'copy') {

      var realArr = [];
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
          chrome.storage.sync.set({ 'messageUpOrCrPhone': data }, function () { });
        })
      })

    } else if (request.type == 'getdetail') {

      let arrSend = {
        "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
        "cus_code": request.cus_code,
      }
      chrome.storage.sync.get(['phone'], function (result) {
        if (result && result.phone == '000') {
          base_url = 'http://dev.seoulspa.vn';
        } else {
          base_url = 'http://app.seoulspa.vn'
        }
        fetch(base_url + '/api/index.php/pancake/GetCustomerInfor', {
          method: 'post',
          body: JSON.stringify(arrSend)
        }).then(r => {
          r.json().then(function (data) {
            console.log(data);

            chrome.storage.sync.set({ 'cusdetail': data }, function () {
            });
          })
        })
      })

    } else if (request.type == 'updateDataInbox') {
      sendResponse({ status: 1, message: "Call api update has oke" });
      chrome.storage.sync.get(['inboxUserData','phone'], function (result) {
        if(result && result.inboxUserData.length > 0){
          result.inboxUserData.forEach(element => {
            element.api_key = '1DB185DCFB40836B29BFC1A500E3EB';
            element.user_id = element.user_id;
            element.conversation_code = element.inbox_id;
            element.latest_update = element.time;
          });
          
          var based_url = result.phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
          console.log('based_url',based_url);
          
          fetch(based_url + '/api/index.php/pancake/api_update_detail_converesation', {
            method: 'post',
            body: JSON.stringify(result.inboxUserData)
          }).then(r => {
            chrome.storage.sync.set({ 'inboxUserData': [],'last_update_inbox': (new Date()).toISOString() }, function () { });
          })
        }
      })
    }
  });