
chrome.runtime.onConnect.addListener(function (externalPort) {
  externalPort.onDisconnect.addListener(function () {
    console.log("onDisconnect")
    // Do stuff that should happen when popup window closes here
  })
  console.log("onConnect")
})

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log('request', request);
    let base_url = '';
    if(request.type == 'key'){
      let data = {
        "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
        "user_id": request.user_id,
        "cus_code": request.customer,
        "conversation_code": request.conversation
      }

      if (request.phone && request.user_id) {
        //check user has inbox
        let index = request.inboxUserData.findIndex(e => {
          return e.inbox_id == request.conversation && e.user_id == request.user_id;
        });
        console.log(index);
        if (index >= 0) {
          sendResponse({ status: 1, message: "Đã nhắn tin với user này!" });
          //set user inbox to store
          var today = new Date();
          var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          var dateTime = date+' '+time;
          // request.inboxUserData.push({ inbox_id: request.conversation, user_id: request.user_id, time: dateTime });
          request.inboxUserData[index].time = dateTime;
          chrome.storage.sync.set({ inboxUserData: request.inboxUserData }, function () { });
        } else {
          var arrData = Array();
          arrData.push(data);
          request.inboxUserData.push({ inbox_id: request.conversation, user_id: request.user_id});
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
    } else if(request.type == 'copy'){
      let arrSend = {
        "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
        "user_id": request.user_id,
        "cus_code": request.customer,
        "cus_phone": request.customer_phone,
        "conversation_code": request.conversation
      }
      base_url = request.phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
      fetch(base_url + '/api/index.php/pancake/api_update_pancake_conversation', {
        method: 'post',
        body: JSON.stringify(arrSend)
      }).then(r => {
      })
      sendResponse({ status: 1, message: "Thêm số điện thoại thành công!" });
    }
  });