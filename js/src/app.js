angular.module('app', [])
  .controller('mainCtrl', function ($scope, $http) {
    $scope.init = () => {
      var port = chrome.runtime.connect();
      $scope.base_url = 'http://app.seoulspa.vn';
      $scope.staffs = [];
      $scope.urls = {};
      $scope.sendValue = {};
      $scope.enable_status = true;
      $scope.showtag();

      $scope.showEedit();

      const code = `(function getUrls(){
        const forkUrl = document.getElementById("linkConversation").getAttribute('data-clipboard-text');
        const href = window.location.href;
        return { forkUrl, href };
      })()`;
      chrome.tabs.executeScript({ code }, function (result) {
        const { forkUrl, href } = result[0];
        $scope.$apply(function () {
          var url = forkUrl;
          var search = url.indexOf('=');
          var main_param = url.slice(search + 1);
          var id_pos = main_param.indexOf('_');
          $scope.sendValue.conversation = main_param;
          $scope.sendValue.customer = main_param.slice(id_pos + 1);
        });
      });
      chrome.storage.sync.get(['keyttv'], function (result) {
        $scope.sendValue.path = result.keyttv;
        $scope.sendValue.tag = result.keyttv;
        if ($scope.sendValue.tag == null || $scope.sendValue.tag == "") {
          $scope.enable_status = false;
        } else {
          $scope.enable_status = true;
        }
      });


      $scope.now = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
      $scope.noel = new Date('2019/12/30');
      $scope.realnow = new Date($scope.now);
      chrome.storage.sync.get(['key'], function (result) {
        var real_date = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        if (typeof (result.key) == 'undefined') {
          $scope.login_require = true;
        } else if (real_date > result.key) {
          $scope.login_require = true;
        } else {
          $scope.login_require = false;
        }
      });

      chrome.storage.sync.get(['phone','login'], function (result) {
        console.log('login',result.login);
        
        if (result && result.phone == '000') {
          $scope.base_url = 'http://dev.seoulspa.vn';
        }
        if (result && result.phone) {
          $scope.staffsRequest();
        }
      })
    }

    chrome.tabs.getSelected(null, function (tab) {
      var tablink = tab.url;
      var pos = tablink.indexOf('pages.fm');
      if (pos == -1) {
        $('body').append('<div class="err-out">Cần mở cuộc trò chuyện tại PANCAKE để tiếp tục</div>')
      }
    });
    $scope.staffsRequest = () => {
      chrome.storage.sync.get(['staffs'], function (result) {
        if (typeof (result.staffs) == 'undefined' || result.staffs == null) {
          $scope.getListStaff();
        } else {
          $scope.$apply(function () {
            $scope.staffs = result.staffs;
          })
        }
      });
    }

    $scope.getListStaff = () => {
      fetch($scope.base_url + '/api/index.php/pancake/api_get_all_tvv').then(r => {
        r.json().then(function (data) {
          $scope.$apply(function () {
            $scope.staffs = data.data;
            chrome.storage.sync.set({ staffs: data.data }, function () { });
          });
        })
      })
    }
    $scope.showEedit = () => {
      chrome.storage.sync.get(['key'], function (result) {
        $scope.login_status = result.key;
        if ($scope.login_status == true) {
          $('.sign-form').removeClass('disabled');
          $scope.btn_text = 'Thay đổi người gửi'
        } else {
          $('.sign-form').addClass('disabled');
          $scope.btn_text = 'Xác Nhận'
        }
      });
    }
    $scope.sign_in = (cond) => {
      if (cond == true) {
        chrome.storage.sync.set({ key: false }, function () {
        });
      } else {
        chrome.storage.sync.set({ key: true }, function () {
        });
      }
      $scope.showEedit();
    }
    $scope.showtag = () => {
      $scope.sendValue.tag = $scope.sendValue.path;
      if ($scope.sendValue.path == null || $scope.sendValue.path == "") {
        $scope.enable_status = false;
        $("input.tag").removeAttr('disabled');

      } else {
        $scope.enable_status = true;
        $("input.tag").attr('disabled', 'disabled');

      }
      chrome.storage.sync.set({ 'keyttv': $scope.sendValue.tag }, function () { });
    }
    $scope.GetURLParameter = (url, sParam) => {
      var sPageURL = url;
      var sURLVariables = sPageURL.split('&');
      for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
          return sParameterName[1];
        }
      }
    }
    $scope.go_in = () => {
      var temp = $('.selectpicker.sender').find(':selected').attr('data-id');
      $scope.sendValue.user_id = temp;
      if ($scope.sendValue.tag == null || $scope.sendValue.tag == "") {
        $.notify('Bạn chưa có Tag! Vui lòng nhập tag!', 'error');
      } else if ($scope.sendValue.phone == null || $scope.sendValue.phone == "") {
        $.notify('Nhập số điện thoại khách hàng đã lấy được!', 'error')
      }
      else if ($scope.sendValue.customer == null || $scope.sendValue.customer == "") {
        $.notify('Có lỗi xảy ra! Chọn một cuộc trò chuyện để tiếp tục', 'error')
      } else {
        var phoneno = /^[0-9]+$/;
        if ($scope.sendValue.phone.match(phoneno)){
          $('.send-button').addClass('loading');
          let arrSend = {
            "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
            "user_id": $scope.sendValue.user_id,
            "tag_name": $scope.sendValue.tag,
            "cus_code": $scope.sendValue.customer,
            "cus_phone": $scope.sendValue.phone,
            "conversation_code": $scope.sendValue.conversation
          }
          fetch($scope.base_url + '/api/index.php/pancake/api_update_pancake_conversation', {
            method: 'post',
            body: JSON.stringify(arrSend)
          }).then(r => {
            r.json().then(function (data) {
              $('.send-button').removeClass('loading');
              if (data.status == 1) {
                $.notify('Gửi thành công', 'success');
                setTimeout(function explode() {
                  window.close();
                }, 1000);
              } else {
                $.notify(data.message, 'error');
              }
            })
          })
        }else{
          $.notify('Số điện thoại không hợp lệ!', 'error')
        }
      }
    }
    $scope.login = () => {
      if ($scope.login.id == null || $scope.login.id == "") {
        $.notify('Lỗi', 'error');
      } else if ($scope.login.password == null || $scope.login.password == "") {
        $.notify('Lỗi', 'error')
      } else if ($scope.login.id == '000' && $scope.login.password == "123") {
        $.notify('Đăng nhập thành công', 'success');
        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        chrome.storage.sync.set({ key: utc, phone: '000', user_id: 1323, inboxUserData: [],login: 999999 }, function () { });
        $scope.login_require = false;
        $scope.base_url = 'http://dev.seoulspa.vn';
        $scope.getListStaff();
        let params = {
          active: true,
          currentWindow: true
        };

      } else {
        $('.login-btn').addClass('loading');
        var arrSend = {
          "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
          "identity": $scope.login.id,
          "password": $scope.login.password
        }
        fetch($scope.base_url + '/api/index.php/user/login', {
          method: 'post',
          body: JSON.stringify(arrSend)
        }).then(r => {
          r.json().then(function (data) {
            if (data.status == 200) {
              $.notify('Đăng nhập thành công', 'success');
              var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
              chrome.storage.sync.set({ key: utc, phone: data.user.phone, user_id: data.user.id, inboxUserData: [] }, function () { });
              $scope.$apply(function () {
                $scope.login_require = false;
                $scope.getListStaff();
              });
            } else {
              $.notify('Đăng nhập thất bại', 'error');
            }
            $('.login-btn').removeClass('loading');
          })
        })
      }
    }
    $scope.logout = () => {
      chrome.storage.sync.remove(['key', 'phone', 'staffs', 'inboxUserData'], function (result) {
        $scope.$apply(function () {
          $scope.login_require = true;
          $scope.base_url = 'http://app.seoulspa.vn';
          $scope.staffs = [];
        });
      });
    }
  })