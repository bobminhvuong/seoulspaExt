console.log('Connect to SeoulSpa extention!');
var message = '';
setIcon();
setStyleBox();

document.addEventListener("click", function (event) {
    var targetElement = event.target || event.srcElement;
    if (targetElement.classList.contains("submit-send")) {
        submitPhone();
    } else if (targetElement.classList.contains("be-clicked")) {
        $('.main-form.main-two').addClass('load');
        $('.main-form').addClass('load');
        setForm();
        setTimeout(() => { getInFoCus(); }, 500);
        setTimeout(() => {  $('.main-form').removeClass('load'); }, 1000);

    } else if (targetElement.classList.contains("book-now")) {
        toBookApmt();
    } else if (targetElement.classList.contains("history_cus")) {
        toHistory();
    } else if (targetElement.classList.contains("logout-sub")) {
        logOut();
    } else if (targetElement.classList.contains("login-submit")) {
        login();
    }
});
function logOut() {
    chrome.storage.sync.remove(['dateLogin', 'phone', 'user_name', 'groupService'], function (result) {
        $('body').addClass('login');
        $('#customerCol').html(`
                    <div class="my-test">
                    <div class="main-form">
                        <h4 style="color:#814022">SeoulSpa.vn</h4>
                        <div class="form-group"> 
                            <label for="">Tài khoản</label>
                            <input type="text" id="login_id"> 
                        </div>
                        <div class="form-group"> 
                            <label for="">Mật khẩu</label>
                            <input type="password" id="login_pass"> 
                        </div>  
                        <div class="form-group" style="margin-bottom: 0"> <button class="login-submit">Đăng nhập</button> </div>
                    </div>
            </div>
        `);
    });
}
function show_icon() {
    var phone_tag = $('.phone-tag');
    phone_tag.each(function () {
        if ($(this).hasClass('active')) {
        } else {
            $(this).addClass('active');
            $(this).css("position", "relative");
            $(this).append(`
                <div class="send" title="Gửi số điện thoại" 
                    style="position: absolute; top: -30px; right: 0;width: 20px; height: 20px;background: white; margin: auto; border-radius: 50%;cursor: pointer;">
                    <img src="https://seoulspa.vn/wp-content/uploads/2016/08/icon.png" style="width:70%; height: auto;">
                </div>`);
        }
    });
}



function sendAndClearData() {
    let data = {
        type: 'sendAndClear',
    }
    chrome.runtime.sendMessage(data, function (response) { })
}

function login() {
    var login_id = $('#login_id').val();
    var login_pass = $('#login_pass').val();

    if (!login_id || login_id == "" || !login_pass || login_pass == "") {
        setNotify('error', 'Thông tin đăng nhập không đúng!');
    } else {
        let data = {
            phone: login_id,
            password: login_pass,
            type: 'login'
        }
        chrome.runtime.sendMessage(data, function (response) {
            chrome.extension.onMessage.addListener(function (res, sender, sendResponse) {
                if (res && res.type == 'login') {
                    if (res.status == 200) {
                        let datelogin = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
                        chrome.storage.sync.set({ 
                                'phone': res.user.phone, 
                                'dateLogin': datelogin, 
                                'user_name': res.user.last_name + res.user.first_name,
                                'user_id': res.user.id
                             }, function () { });
                        setNotify('success', res.message);
                        $('#pageCustomer').removeClass('active');
                    } else {
                        setNotify('error', res.message ? res.message : 'Đã có lỗi xẩy ra. Vui lòng thử lại!');
                    }
                }
                if(res && res.type =='groupService'){
                    setForm();
                    getInFoCus();
                    setTimeout(() => {
                        chrome.storage.sync.get(['user_name'], function (result) {
                            $('.staff-name').html(result.user_name);
                        })
                    }, 200);
                }
            })
        })
    }
}

function getGroupService() {
    chrome.storage.sync.get(['phone'], function (result) {
        let data = {
            type: 'getGroupServices',
            phone: result.phone
        }
        chrome.runtime.sendMessage(data, function (response) { })
    });

}
function toBookApmt() {
    var customer_phone = $('input#cus_phone').val();
    var customer_name = $('#customer-name').val();
    if (customer_phone == '' || customer_phone == null) {
        $('input#cus_phone').focus();
    } else {
        chrome.storage.sync.get(['phone'], function (result) {
            if (result && result.phone == '000') {
                base_url = 'http://dev.seoulspa.vn';
            } else {
                base_url = 'http://app.seoulspa.vn'
            }
            var url = base_url + '/appointments/add?name_input=' + customer_name + '&phone_input=' + customer_phone + '';
            window.open(url, '_blank');
        })
    }
}

function toHistory() {
    var customer_id = $('input#cus_id').val();
    chrome.storage.sync.get(['phone'], function (result) {
        if (result && result.phone == '000') {
            base_url = 'http://dev.seoulspa.vn';
        } else {
            base_url = 'http://app.seoulspa.vn'
        }
        var url = base_url + 'customers/history/' + customer_id + '';
        window.open(url, '_blank');
    })
}

function getInFoCus() {
    const forkUrl = document.getElementById("linkConversation").getAttribute('data-clipboard-text');
    var url = forkUrl;
    var search = url.indexOf('=');
    var main_param = url.slice(search + 1);
    var id_pos = main_param.indexOf('_');
    let data = {
        type: 'getdetail',
        cus_code: main_param.slice(id_pos + 1)
    }
    chrome.runtime.sendMessage(data, function (response) {
        //on data when get api get customer detail
        chrome.extension.onMessage.addListener(function (res, sender, sendResponse) {
            $('.main-form.main-two').removeClass('load');
            $('.main-form.main-two').removeClass('new');
            if (res && res.type == 'getdetail') {
                if (res.status == 1 && res.data) {
                    
                    let data = res.data;

                    if (data.customer_sent_code == main_param.slice(id_pos + 1)) {
                        $('input#cus_phone').val(data.customer_phone);
                        $('input#cus_id').val(data.id);

                        if (data.description != null) {
                            $('.cn span.value').html(data.description);
                        }
                        if (data.total != null) {
                            x = data.total.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
                            $('.money span.value').html(x + 'VNĐ');
                        }
                        if (data.total_com != null) {
                            $('.report span.value').html(data.total_com + ' lần');
                        }
                        if (data.service != null) {
                            $('#store_id').val(data.service);
                        }
                        if (data.is_old == 0) {
                            $('.main-form.main-two').addClass('new');
                        }
                    } else{
                        $('.main-form.main-two').addClass('new');
                    }
                    } else {
                    $('input#cus_phone').val('');
                    $('select#store_id').val(1);
                    $('.main-form.main-two').addClass('new');
                }
            }

        });
    })
}

function submitPhone() {
    $('button.submit-send').html('•••');
    let phone = $('#cus_phone').val();
    var phonereg = /^[0-9]+$/;
    if (phone.match(phonereg)) {
        let data = {
            type: 'submitPhone',
            conversation: $('#conversation-code').val(),
            customer_phone: $('#cus_phone').val(),
            customer: $('#customer-code').val(),
            cus_name: $('#customer-name').val(),
            service: $('#store_id').val(),
        }
        $('button.submit-send').html('Gửi');
        chrome.storage.sync.get(['user_id', 'phone'], function (result) {
            let rq = { ...data, ...result }
            chrome.runtime.sendMessage(rq, function (response) {
                chrome.extension.onMessage.addListener(function (res, sender, sendResponse) {
                    
                    if (res && res.status && res.type == 'submitPhone') {
                        setNotify('success', res.message);
                        getInFoCus();
                    }
                })

            })
        })
    } else {
        setNotify('error', 'Số điện thoại không hợp lệ!');
    }

}

function setForm() {
    chrome.storage.sync.get(['phone'], function (data) {
        if (data.phone) {
            var user_box = $('#pageCustomer');
            var user_name = user_box.attr('data-clipboard-text');
            var text_option = '';
            if (user_box.length > 0) {
                if (!user_box.hasClass('active')) {
                    user_box.addClass('active');
                    chrome.storage.sync.get(['groupService'], function (result) {
                        var text_option = '';
                        result.groupService.data.forEach(element => {
                            text_option = text_option + '<option value="' + element.id + '">' + element.name + '</option>'
                        });
                        $('#customerCol').html(`
                        <div class="my-test">
                            <div class="staff-name"></div>
                            <div style="text-align: right;">
                                <div class="logout-sub">Đăng xuất</div>
                            </div>
                            <div class="main-form">
                                <div class="form-group"> <label for="">Tên khách</label><input type="text" id="customer-name" disabled> </div>
                                <div class="form-group" style="display:none;"><label for="">Mã khách hàng</label> <input type="text"
                                        id="customer-code" disabled> </div>
                                <div class="form-group" style="display:none;"> <label for="">Mã cuộc hội thoại</label> <input type="text"
                                        disabled id="conversation-code"> </div>
                                <div class="form-group"> <label for="">Số điện thoại</label> <input type="text" id="cus_phone"> </div>
                                <div class="form-group"> <label for="">Dịch vụ cần tư vấn</label><select name="" id="store_id">' + ${text_option} +
                                        '</select> </div>
                                <div class="form-group" style="margin-bottom: 0"> <button class="submit-send">Gửi</button> </div>
                            </div>
                            <div class="main-form main-two" style="margin-top: 20px;">
                                <div class="cn"> <span class="tit">Chi nhánh:</span><span class="value">Chưa có</span></div>
                                <div class="money"><span class="tit">Số tiền đã dùng:</span><span class="value">Chưa có</span></div>
                                <div class="report"><span class="tit">Khiếu nại:</span><span class="value">Chưa có</span></div><input
                                    id="cus_id" style="display:none;">
                                <div class="history_cus">Xem thêm lịch sử khách</div>
                            </div>
                            <div class="book-now">Đặt lịch ngay</div>
                        </div>`)
                    })
                }
                setTimeout(() => {
                    const cus_name = document.getElementById("pageCustomer").getAttribute('data-clipboard-text');
                    const forkUrl = document.getElementById("linkConversation").getAttribute('data-clipboard-text');
                    var url = forkUrl;
                    var search = url.indexOf('=');
                    var main_param = url.slice(search + 1);
                    var id_pos = main_param.indexOf('_');
                    $('#customer-name').val(cus_name);
                    $('#customer-code').val(main_param.slice(id_pos + 1));
                    $('#conversation-code').val(main_param);
                }, 500);
            }
        } else {
            $('#customerCol').html(`
            <div class="my-test">
                <div class="main-form">
                    <h4 style="color:#814022">SeoulSpa.vn</h4>
                    <h3>Vui lòng đăng nhập để sử dụng tiện ích!</h3>
                    <div class="form-group"> 
                        <label for="">Tài khoản</label>
                        <input type="text" id="login_id"> 
                    </div>
                    <div class="form-group"> 
                        <label for="">Mật khẩu</label>
                        <input type="password" id="login_pass"> 
                    </div>
                    <div class="form-group" style="margin-bottom: 0"> <button class="login-submit">Đăng nhập</button> </div>
                </div>
            </div>
            `)
        }
    })
}

document.addEventListener('copy', (event) => {
    if (isNaN(event.target.value) == false) {
        $('#cus_phone').val(event.target.value);
    }
});

$(document).on('keydown', function (e) {
    let text = $('#replyBoxComposer').val();
    message = text != '' ? text : message;
    var phone_tag = $('.phone-tag');
    phone_tag.each(function () {
        if ($(this).hasClass('active')) {
        } else {
            $(this).addClass('active');
            $(this).css("position", "relative");
            $(this).append(`
                <div class="send" title="Gửi số điện thoại" 
                    style="position: absolute; top: -30px; right: 0;width: 20px; height: 20px;background: white; margin: auto; border-radius: 50%;cursor: pointer;">
                    <img src="https://seoulspa.vn/wp-content/uploads/2016/08/icon.png" style="width:70%; height: auto;">
                </div>`);
        }
    });


    if (e.which == 13 && !e.shiftKey && message != '' && !$('svg').hasClass('message-action')) {
        const forkUrl = document.getElementById("linkConversation").getAttribute('data-clipboard-text');
        const cus_name = document.getElementById("pageCustomer").getAttribute('data-clipboard-text');
        var url = forkUrl;
        var search = url.indexOf('=');
        var main_param = url.slice(search + 1);
        var id_pos = main_param.indexOf('_');
        let data = {
            type: 'key',
            conversation: main_param,
            customer: main_param.slice(id_pos + 1),
            cus_name: cus_name
        }
        chrome.storage.sync.get(['phone', 'key', 'user_id', 'inboxUserData'], function (result) {
            let rq = { ...data, ...result }
            chrome.runtime.sendMessage(rq, function (response) {
                message = '';
                if (response.status == 0) {
                    setNotify('error', 'Bạn chưa đăng nhập vào tiện ích SeoulSpa!')
                }
            });
        });
    }
});

function checklogin() {

    chrome.storage.sync.get(['dateLogin', 'last_update_inbox', 'phone', 'time_send'], function (data) {
        //logout if diff now
        let now = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        if (data.dateLogin != now) chrome.storage.sync.remove(['key', 'phone', 'staffs', 'user_name', 'groupService'], function (result) { });

        if (typeof (data.key) == 'undefined') {
            if (!$('body').hasClass('login')) {
                $('body').addClass('login');
                $('#customerCol').html(`
                    <div class="my-test">
                        <div class="main-form top-form">
                            <h4 style="color:#814022">SeoulSpa.vn</h4>
                            <div class="form-group"> 
                                <label for="">Tài khoản</label>
                                <input type="text" id="login_id"> 
                            </div>
                            <div class="form-group"> 
                                <label for="">Mật khẩu</label>
                                <input type="password" id="login_pass"> 
                            </div>  
                            <div class="form-group" style="margin-bottom: 0"> <button class="login-submit">Đăng nhập</button> </div>
                        </div>
                    </div>
                    `);
            }
        } else {
            $('#pageCustomer').removeClass("active");
        }
    });

}

function setNotify(type, msg) {
    $('.notifications-wrapper').html(`<div class="notifications-br"
    style="${type == 'error' ? `font-family: inherit; position: fixed; width: 320px; 
                                padding: 0px 10px 10px; z-index: 9998; box-sizing: border-box;
                                 height: auto; top: auto; bottom: 0px; 
                                 left: auto; right: 0px;`
            : `font-family: inherit; position: fixed; 
                                  width: 320px; padding: 0px 10px 10px; z-index: 9998; 
                                  box-sizing: border-box; height: auto; top: auto; 
                                  bottom: 0px; left: auto; right: 0px;` }">
    <div class="notification notification-${type} notification-visible"
        style="${type == 'error' ? `position: relative; width: 100%;
                                     cursor: pointer; border-radius: 2px; 
                                     font-size: 13px; margin: 10px 0px 0px; padding: 10px; 
                                     display: block; box-sizing: border-box; opacity: 1; transition: all 0.3s ease-in-out 0s; 
                                     transform: translate3d(0px, 0px, 0px); will-change: transform, opacity; border-top: 2px solid rgb(236, 61, 61);
                                     background-color: rgb(244, 233, 233); color: rgb(65, 47, 47); box-shadow: rgba(236, 61, 61, 0.9) 0px 0px 1px; right: 0px; height: 
                                     83px;`: `position: relative; width: 100%; cursor: pointer; 
                                     border-radius: 2px; font-size: 13px; margin: 10px 0px 0px; 
                                     padding: 10px; display: block; box-sizing: border-box; opacity: 1; 
                                     transition: all 0.3s ease-in-out 0s; transform: translate3d(0px, 0px, 0px); 
                                     will-change: transform, opacity; border-top: 2px solid green;
                                      background-color: rgb(244, 233, 233); color: green; 
                                      box-shadow: green 0px 0px 1px; right: 0px; height: 83px;`}">
        <h4 class="notification-title"
            style="${type == 'error' ? 'font-size: 14px; margin: 0px 0px 5px; padding: 0px; font-weight: bold; color: rgb(236, 61, 61);' : 'font-size: 14px; margin: 0px 0px 5px; padding: 0px; font-weight: bold; color: green;'}">Thông báo</h4>
        <div class="notification-message" style="margin: 0px; padding: 0px;">${msg}</div><span class="notification-dismiss"
            style="cursor: pointer; font-family: Arial; font-size: 17px; position: absolute; top: 4px; right: 5px; line-height: 15px; background-color: rgb(228, 190, 190); color: rgb(244, 233, 233); border-radius: 50%; width: 14px; height: 14px; font-weight: bold; text-align: center;">×</span>
    </div>
</div>`);

    setTimeout(() => {
        $('.notifications-wrapper').html('');
    }, 5000);
}

function setIcon() {
    show_icon();
    checklogin();
    chrome.storage.sync.get(['user_name'], function (result) {
        $('.staff-name').html(result.user_name);
    })
    setTimeout(() => {
        var temp = $('.media.conversation-list-item');
        temp.each(function (index) {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active');
                $(this).find("div").addClass('be-clicked');
                $(this).find("span").addClass('be-clicked');
                $(this).find("img").addClass('be-clicked');
            }
        });
    }, 0);

    setTimeout(() => {
        setIcon();
    }, 3000);
}



function setStyleBox() {

    $('head').append(`<style>
                #customerCol{position:relative;}
                .my-test{
                    padding: 30px 15px;
                    position: absolute; 
                    width: 100%; 
                    height: 100%; top:0; 
                    left: 0;
                    background: rgba(30,29,31,1);
                    background: -moz-linear-gradient(-45deg, rgba(30,29,31,1) 0%, rgba(223,64,90,1) 100%);
                    background: -webkit-gradient(left top, right bottom, color-stop(0%, rgba(30,29,31,1)), color-stop(100%, rgba(223,64,90,1)));
                    background: -webkit-linear-gradient(-45deg, rgba(30,29,31,1) 0%, rgba(223,64,90,1) 100%);
                    background: -o-linear-gradient(-45deg, rgba(30,29,31,1) 0%, rgba(223,64,90,1) 100%);
                    background: -ms-linear-gradient(-45deg, rgba(30,29,31,1) 0%, rgba(223,64,90,1) 100%);
                    background: linear-gradient(135deg, rgba(30,29,31,1) 0%, rgba(223,64,90,1) 100%);}
                .form-group{
                    display: flex; 
                    justify-content: space-between; 
                    flex-wrap:wrap;
                     align-items: center;
                }
                .form-group label{
                    width: 100%
                    ;font-size: 13px;
                }
                .form-group input, .form-group select{
                    width: 100%;
                    height: 25px; 
                    padding: 0px 10px; 
                    background-color: rgba(0,0,0,0.03); 
                    border: none; 
                    display: inline; 
                    color: #303030; 
                    font-size: 14px; 
                    font-weight: 400; 
                    float: left; 
                    -webkit-box-shadow: inset 1px 1px 0px rgba(0,0,0,0.05), 1px 1px 0px rgba(255,255,255,1); 
                    -moz-box-shadow: inset 1px 1px 0px rgba(0,0,0,0.05), 1px 1px 0px rgba(255,255,255,1); 
                    box-shadow: inset 1px 1px 0px rgba(0,0,0,0.05), 1px 1px 0px rgba(255,255,255,1);
                }
                .main-form{
                    position: relative; 
                    border-radius: 3px;background: white; 
                    padding: 15px;
                }
                button.submit-send, .login-submit{
                    width: 100%; height: 35px;
                    margin-top: 20px; 
                    padding: 0px 20px; 
                    font-weight: 700; 
                    font-size: 18px; 
                    color: #fff; 
                    line-height: 35px; 
                    text-align: center; 
                    background-color: #87314e; 
                    border: 1px #87314e solid; 
                    opacity: 1; cursor: pointer;
                }
                .form-group input:focus, .form-group select:focus{
                    background-color: #f8f8c6; outline: none;
                } 
                span.tit{
                    font-weight: bold;
                    margin-right: 7px;
                } 
                .main-form.main-two > div{
                    margin-bottom: 5px;
                } 
                .staff-name {
                    font-size: 18px;
                    color: white;
                    text-align: right;
                    font-weight: bold;
                }
                .main-form.main-two.new:after{
                    content: "Khách mới"; 
                    position: absolute; 
                    width: 95%; height: 90%; 
                    background: white; 
                    top: 50%; left: 50%; 
                    transform: translate(-50%, -50%); 
                    padding: 15px; z-index: 98;
                }
                .logout-sub {
                    color: white;
                    font-size: 12px;
                    text-align: right;
                    text-decoration: underline;
                    cursor: pointer;
                    display: inline-block;
                }
                .book-now{ 
                    cursor: pointer;
                    display: block; 
                    width: 100%; 
                    height: auto; 
                    text-align: center;
                    padding: 7px 0; 
                    margin-top: 15px; 
                    background: white; 
                    color: #87314e; 
                    font-size: 16px; 
                    font-weight: bold; 
                    text-transform: uppercase;
                }.history_cus{
                    cursor: pointer; 
                    color: blue; 
                    font-size: 12px;
                }
                .main-form.load:before {
                    content: url(http://app.seoulspa.vn/assets/images/load.svg);
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    top: 0;
                    left: 0;
                    background: rgba(255, 255, 255, 0.43);
                    z-index: 999;
                }
            </style>`);
}