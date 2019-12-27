console.log('Connect to SeoulSpa extention!');
var message = '';
setIcon();
setClicked();
setStyleBox();
set_select2();

document.addEventListener("click", function (event) {
    var targetElement = event.target || event.srcElement;
    if (targetElement.classList.contains("submit-send")) {
        submitPhone();
    } 
    else if (targetElement.classList.contains("be-clicked")) {
        $('.main-form.main-two').addClass('load');
        $('.main-form').addClass('load');
        setForm();
        setTimeout(() => { getInFoCus(); set_select2(); }, 500);
        setTimeout(() => { $('.main-form').removeClass('load'); }, 1000);

    } else if (targetElement.classList.contains("book-now")) {
        toBookApmt();
    } else if (targetElement.classList.contains("history_cus")) {
        toHistory();
    } else if (targetElement.classList.contains("logout-sub")) {
        logOut();
    } else if (targetElement.classList.contains("login-submit")) {
        login();
    }  else if (targetElement.classList.contains("see-more")) {
        viewDetailInfor();
    } else if (targetElement.classList.contains("note-seemore")) {
        viewDetailNote();
    } else if (targetElement.classList.contains("btn-tag-item")) {
        sendTags();
    } else if (targetElement.classList.contains("select2-selection__rendered")) {
        console.log( $('#store_id').select2('val'));
    }
});

function set_select2(){
    var a = $('#store_id');
    if(a.length <= 0){
        setTimeout(() => {
            set_select2();
        }, 1000);
    } else {
        $('.js-example-basic-multiple').select2();
    }
}

function sendTags(){
    setTimeout(() => {
        var tag_array = [];
        var btn_tag = $('.btn-tag-item');
        btn_tag.each(function( index ) {
            var alpha = $(this).css("background-color").replace(/^.*,(.+)\)/,'$1');
            if(alpha >= 1 || alpha <= 0){
                tag_array.push($(this).text())
            }
        });
        let data = {
            type: 'sendTags',
            conversation: $('#conversation-code').val(),
            cus_name: $('#customer-name').val(),
            tags: tag_array,
        }
        chrome.storage.sync.get(['user_id', 'phone'], function (result) {
            let rq = { ...data, ...result }
            chrome.runtime.sendMessage(rq, function (response) {
                chrome.extension.onMessage.addListener(function (res, sender, sendResponse) {
                    if (res && res.status && res.type == 'sendTags') {
                        if(res.status == 400){
                            setNotify('error', res.message);
                        } else{
                            setNotify('success', res.message);
                        }
                    }
                })
            })
        })
    }, 500);
}
function viewDetailNote (){
    if($('.note-onindex').hasClass('active')){
        $('.note-onindex').removeClass('active');
        $('.note-seemore').html('Xem thêm ghi chú');
    } else {
        $('.note-seemore').html('Đóng');
        $('.note-onindex').addClass('active');
    }
    const forkUrl = document.getElementById("linkConversation").getAttribute('data-clipboard-text');
    var url = forkUrl;
    var search = url.indexOf('=');
    var main_param = url.slice(search + 1);
    var id_pos = main_param.indexOf('_');
    let data = {
        type: 'getNoteDetail',
        cus_code: main_param.slice(id_pos + 1),
    }
    chrome.runtime.sendMessage(data, function (response) { 
        chrome.extension.onMessage.addListener(function (res, sender, sendResponse) {
            if (res && res.status && res.type == 'getNoteDetail') {
                
            }
        })
    })
}
function viewDetailInfor(){
    if($('.on-index').hasClass('active')){
        $('.on-index').removeClass('active');
        $('.see-more').html('Xem');
    } else {
        $('.see-more').html('Đóng');
        $('.on-index').addClass('active');
    }
}
function logOut() {
    chrome.storage.sync.remove(['dateLogin', 'phone', 'user_name', 'groupService'], function (result) {
        $('body').addClass('login');
        $('#customerCol').html(`
                    <div id="box-test" class="my-test">
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
                if (res && res.type == 'groupService') {
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
        var url = base_url + '/customers/history/' + customer_id + '';
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
        cus_code: main_param.slice(id_pos + 1),
        page_id: main_param.slice(0,id_pos),
    }
    chrome.runtime.sendMessage(data, function (response) {
        chrome.extension.onMessage.addListener(function (res, sender, sendResponse) {
            $('.main-form.main-two').removeClass('load');
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
                            $('#store_id').select2('val', data.service);
                        } else{
                            $('#store_id').val(0);
                        }
                        if (data.note != null) {
                            $('#cus_note').val(data.note);
                        }
                        if (data.is_old == 0) {
                            $('.customer-status').html('Khách mới');
                        }else{
                            $('.customer-status').html('Khách cũ');
                            $('.customer-status').append('<div class="see-more">Xem</div>')
                        }
                    } else {
                        $('.customer-status').html('Khách mới');
                    }
                } else {
                    $('input#cus_phone').val('');
                    $('select#store_id').val(1);
                    $('.main-form.main-two').addClass('new');
                    $('#store_id').val(0);
                }
            }

        });
    })
}

function submitPhone() {
    $('button.submit-send').html('•••');
    let service_id = $('#store_id').val();
    if (service_id && service_id.length > 0) {
        let data = {
            type: 'submitPhone',
            conversation: $('#conversation-code').val(),
            customer_phone: $('#cus_phone').val(),
            customer: $('#customer-code').val(),
            cus_name: $('#customer-name').val(),
            note: $('#cus_note').val(),
            service: service_id,
        }
        $('button.submit-send').html('Cập nhật');
        chrome.storage.sync.get(['user_id', 'phone'], function (result) {
            let rq = { ...data, ...result }
            chrome.runtime.sendMessage(rq, function (response) {
                chrome.extension.onMessage.addListener(function (res, sender, sendResponse) {
                    if (res && res.status && res.type == 'submitPhone') {
                        if(res.status == 400){
                            setNotify('error', res.message);
                        } else{
                            setNotify('success', res.message);
                            getInFoCus();
                        }
                    }
                })

            })
        })
    } else {
        setNotify('error', 'Chọn dịch vụ tư vấn!');
        $('button.submit-send').html('Gửi');
    }
}
function submitOnSelect2(){
    setTimeout(() => {
        $('#store_id').on('select2:select', function (e) {
            let service_id = $('#store_id').val();
            if (service_id && service_id.length > 0) {
                let data = {
                    type: 'submitPhone',
                    conversation: $('#conversation-code').val(),
                    customer: $('#customer-code').val(),
                    service: service_id,
                }
                $('button.submit-send').html('Cập nhật');
                chrome.storage.sync.get(['user_id', 'phone'], function (result) {
                    let rq = { ...data, ...result }
                    chrome.runtime.sendMessage(rq, function (response) {
                        chrome.extension.onMessage.addListener(function (res, sender, sendResponse) {
                            if (res && res.status && res.type == 'submitPhone') {
                                if(res.status == 400){
                                    setNotify('error', res.message);
                                } else{
                                    setNotify('success', res.message);
                                    getInFoCus();
                                }
                            }
                        })
        
                    })
                })
            } else {
                setNotify('error', 'Chọn dịch vụ tư vấn!');
            }
          });
    }, 1000);
}
function setForm() {
    chrome.storage.sync.get(['phone', 'user_name'], function (data) {
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
                                <div class="form-group">
                                    <label for="">Dịch vụ cần tư vấn</label>
                                    <select id="store_id" class="js-example-basic-multiple" name="states[]" multiple="multiple">${text_option}</select> </div>
                                <div class="form-group" style="position: relative;">
                                     <label for="" style="position: relative;">Ghi chú
                                    </label>
                                      <textarea id="cus_note" rows="3" > </textarea>
                                </div>
                                <div class="form-group" style="margin-bottom: 0"> <button class="submit-send">Cập nhật</button> </div>
                            </div>
                            <div class="main-form main-two" style="margin-top: 15px; padding: 10px;">
                                <div class="customer-status" style="margin:0">Khách mới</div>    
                                <div class="on-index">
                                    <div class="cn"> <span class="tit">Chi nhánh:</span><span class="value">Chưa có</span></div>
                                    <div class="money"><span class="tit">Số tiền đã dùng:</span><span class="value">Chưa có</span></div>
                                    <div class="report"><span class="tit">Khiếu nại:</span><span class="value">Chưa có</span></div><input
                                        id="cus_id" style="display:none;">
                                    <div class="history_cus">Xem thêm lịch sử khách</div>
                                </div>
                            </div>
                            <div class="book-now">Đặt lịch ngay</div>
                        </div>`)
                    })
                }
                for (let index = 0; index < 2; index++) {
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
                        $('#store_id').val(0);
                    }, 1000);
                }
                submitOnSelect2();
            } else {
                $('#customerCol').html(`
                <div class="my-test">
                    <div class="main-form">
                        <h4 style="color:#814022">SeoulSpa.vn</h4>
                        <h4>Xin chào: ${data.user_name}</h4>
                    </div>
                </div>
                `)
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
        const forkUrl = document.getElementById("linkConversation").getAttribute('data-clipboard-text');
        var url = forkUrl;
        var search = url.indexOf('=');
        var main_param = url.slice(search + 1);
        var id_pos = main_param.indexOf('_');
        let phone = event.target.value;
        if (phone) {
            let data = {
                type: 'submitPhone',
                conversation: $('#conversation-code').val(),
                customer_phone: phone,
                customer: main_param.slice(id_pos + 1),
                only_phone: 1
            }
            chrome.storage.sync.get(['user_id', 'phone'], function (result) {
                let rq = { ...data, ...result }
                chrome.runtime.sendMessage(rq, function (response) {
                    chrome.extension.onMessage.addListener(function (res, sender, sendResponse) {
                        if (res && res.status && res.type == 'submitPhone') {
                            if(res.status == 400){
                                setNotify('error', res.message);
                            } else{
                                setNotify('success', res.message);
                                getInFoCus();
                            }
                        }
                    })

                })
            })
    
        } else {
            setNotify('error', 'Số điện thoại không hợp lệ!');
        }
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

    // if(e.which == 13 && !e.shiftKey){
    //     let phone = $('#login_id').val();
    //     if(phone && $('#login_id').length){
    //         login();
    //     }
    // }
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
        if (!data.phone) {
            $('body').addClass('login');
            if ($('#customerCol').length && !$('#box-test').hasClass('my-test')) {
                $('#customerCol').html(`
                <div id="box-test" class="my-test" >
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
            } else {

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
        setIcon();
    }, 3000);
}
function setClicked(){
    var temp = $('.media.conversation-list-item');
        temp.each(function (index) {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active');
                $(this).find("div").addClass('be-clicked');
                $(this).find("span").addClass('be-clicked');
                $(this).find("img").addClass('be-clicked');
            }
        });
    setTimeout(() => {
        setClicked();
    }, 1000);
}

function getConversationCode(){
        const forkUrl = document.getElementById("linkConversation").getAttribute('data-clipboard-text');
        var url = forkUrl;
        var search = url.indexOf('=');
        var main_param = url.slice(search + 1);
    return main_param;
}


function setStyleBox() {
    $('head').append(`<style>
                #customerCol{position:relative;}
                .on-index, .note-onindex{
                    position: absolute;
                    background: white;
                    right: 0;
                    opacity: 0;
                    width: 100%;
                    top: 0;
                    padding: 10px;
                    border-radius: 3px;
                    transition: .2s all linear;
                    z-index: 0;
                    visibility: hidden;
                }
                .on-index.active, .note-onindex.active{
                    right:100%;
                    opacity: 1;
                    visibility: unset;
                }
                .my-test{
                    padding: 10px 15px;
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
                .form-group input, .form-group select, .form-group textarea{
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
                .form-group textarea{
                    height: auto;
                    padding-top:5px
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
                .logout-sub {
                    color: white;
                    font-size: 12px;
                    text-align: right;
                    text-decoration: underline;
                    cursor: pointer;
                    display: inline-block;
                }
                .see-more, .note-seemore {
                    position: absolute;
                    top: 50%;
                    right: 15px;
                    transform: translateY(-50%);
                    color: blue;
                    font-weight: normal;
                    font-size: 12px;
                    text-decoration: underline;
                    z-index: 999;
                    cursor: pointer;
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
                .customer-status {
                    position: relative;
                    line-height: 22px;
                    font-weight: bold;
                }
            </style>`);
}