
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
    let data = {
      api_key: "1DB185DCFB40836B29BFC1A500E3EB",
      user_id: request.user_id,
      tag_name: request.tag_name,
      cus_code: request.customer,
      conversation_code: request.conversation
    }
    if (request.phone && request.user_id) {
      //check user has inbox
      let hasInbox = request.inboxUserData.find(e => {
        return e.inbox_id == request.conversation && e.user_id == request.user_id;
      });

      if (hasInbox) {
        sendResponse({ status: 1, message: "Đã nhắn tin với user này!" });
      } else {
        //set user inbox to store
        request.inboxUserData.push({ inbox_id: request.conversation, user_id: request.user_id });
        chrome.storage.sync.set({ inboxUserData: request.inboxUserData }, function () { });

        base_url = request.phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
        fetch(base_url + '/api/index.php/pancake/api_update_detail_converesation', {
          method: 'post',
          body: JSON.stringify(data)
        }).then(r => {
        })
        sendResponse({ status: 1, message: "Thêm thành công cuộc trò chuyện!" });
      }
    } else {
      sendResponse({ status: 0, message: "Bạn chưa đăng nhập vào tiện ích của SeoulSpa!" });
    }
  });