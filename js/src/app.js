angular.module('app', [])
  .controller('mainCtrl', function ($scope, $http) {
    $scope.init = () => {
      var port = chrome.runtime.connect();
      $scope.base_url = 'http://app.seoulspa.vn';
      $scope.staffs = [];
      $scope.urls = {};
      $scope.sendValue = {};
      $scope.enable_status = true;
      // $scope.login_require = true;
      $scope.now = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
      $scope.noel = new Date('2019/12/30');
      $scope.realnow = new Date($scope.now);

      chrome.storage.sync.get(['user_name', 'key', 'phone'], function (result) {
        $scope.$apply(function () {
          $scope.user_name = result.user_name;
          $scope.login_require = typeof (result.key) == 'undefined' ? true : false;
          $scope.base_url = (result && result.phone == '000') ? 'http://dev.seoulspa.vn' : $scope.base_url;
        });
      })
    }

    chrome.tabs.getSelected(null, function (tab) {
      var tablink = tab.url;
      var pos = tablink.indexOf('pages.fm');
      if (pos == -1) {
        $('body').append('<div class="err-out">Cần mở cuộc trò chuyện tại PANCAKE để tiếp tục</div>')
      }
    });

    $scope.login = () => {

      if (!$scope.login.id || $scope.login.id == "" || !$scope.login.password || $scope.login.password == "") {
        $.notify('Lỗi', 'error');

      } else if ($scope.login.id == '000' && $scope.login.password == "123") {

        $scope.user_name = 'DEV';
        $scope.sendAndClearData('000');
        $.notify('Đăng nhập thành công', 'success');
        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        chrome.storage.sync.set({ key: utc, user_name: 'DEV', phone: '000', user_id: 1323, inboxUserData: [], 'time_send': 1 }, function () { });
        $scope.login_require = false;
        $scope.base_url = 'http://dev.seoulspa.vn';
        $scope.getGroupService();


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
              $scope.sendAndClearData(data.user.phone);

              $.notify('Đăng nhập thành công', 'success');
              var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');

              chrome.storage.sync.set({
                key: utc,
                user_name: data.user.last_name + data.user.first_name,
                phone: data.user.phone,
                user_id: data.user.id,
                inboxUserData: [],
                time_send: 1
              }, function () { });

              $scope.$apply(function () {
                $scope.login_require = false;
                $scope.user_name = data.user.last_name + data.user.first_name;
              });
              $scope.getGroupService();

            } else {
              $.notify('Đăng nhập thất bại', 'error');
            }
            $('.login-btn').removeClass('loading');
          })
        })
      }
    }

    $scope.getGroupService = () => {
      var arrSend = {
        "api_key": "1DB185DCFB40836B29BFC1A500E3EB",
      }
      fetch($scope.base_url + '/api/index.php/pancake/GetGroupServices', {
        method: 'post',
        body: JSON.stringify(arrSend)
      }).then(r => {
        r.json().then(function (data) {
          if (data && data.status == 1) {
            chrome.storage.sync.set({ 'groupService': data }, function () { });
          } else {
            chrome.storage.sync.set({ 'groupService': { data: [] } }, function () { });
          }
        })
      })
    }

    $scope.logout = () => {
      chrome.storage.sync.remove(['key', 'phone', 'staffs', 'user_name', 'groupService'], function (result) {
        $scope.$apply(function () {
          $scope.login_require = true;
          $scope.base_url = 'http://app.seoulspa.vn';
          $scope.staffs = [];
        });
      });
    }

    $scope.sendAndClearData = (phone) => {
      chrome.storage.sync.get(['inboxUserData'], function (result) {
        result.inboxUserData.forEach(element => {
          element.api_key = '1DB185DCFB40836B29BFC1A500E3EB';
          element.user_id = element.user_id;
          element.conversation_code = element.inbox_id;
          element.latest_update = element.time;
        });
        if (result.inboxUserData.length > 0) {
          var based_url = phone == '000' ? 'http://dev.seoulspa.vn' : 'http://app.seoulspa.vn';
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
  })