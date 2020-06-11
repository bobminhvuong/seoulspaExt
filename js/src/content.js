console.log('Connect to SeoulSpa extention!');
var message = '';
var currService = [];
var services = [];
setIcon();
setClicked();
setStyleBox();
set_select2();
autoSendAndClear();
checklogin();

function autoSendAndClear() {
    let data = {
        type: 'sendAndClear',
    }
    chrome.storage.sync.get(['user_id', 'phone'], function(result) {
        let rq = {...data, ...result }
        chrome.runtime.sendMessage(rq, function(response) {
            console.log('Gửi thông tin thành công!');
            // chrome.extension.onMessage.addListener(function(res, sender, sendResponse) {
            //     if (res && res.status && res.type == 'autoSendAndClear') {
            //         console.log(res.message);
            //     }
            // })
        })
    })
    setTimeout(() => {
        autoSendAndClear();
    }, 10800000);
}

document.addEventListener("change", function(event) {
    var targetElement = event.target || event.srcElement;
    if (targetElement.classList.contains("select-option-service")) {
        let ser = services.find(e => { return e.id == $('#store_id').val(); })
        let isExitSer = currService.find(e => { return e.id == $('#store_id').val(); })
        if (ser && !isExitSer) {
            currService.push({ id: ser.id, name: ser.name });
            setShowListService();
            saveWhenChangeService();
        }
    }
})

document.addEventListener("click", function(event) {
    var targetElement = event.target || event.srcElement;
    if (targetElement.classList.contains("submit-send")) {
        submitPhone();
    } else if (targetElement.classList.contains("be-clicked")) {
        $('.main-form.main-two').addClass('load');
        $('.main-form').addClass('load');
        setForm();
        currService = [];
        setTimeout(() => {
            getInFoCus();
            set_select2();
        }, 500);
        setTimeout(() => { $('.main-form').removeClass('load'); }, 1000);
    } else if (targetElement.classList.contains("book-now")) {
        toBookApmt();
    } else if (targetElement.classList.contains("history_cus")) {
        toHistory();
    } else if (targetElement.classList.contains("logout-sub")) {
        logOut();
    } else if (targetElement.classList.contains("login-submit")) {
        login();
    } else if (targetElement.classList.contains("see-more")) {
        viewDetailInfor();
    } else if (targetElement.classList.contains("note-seemore")) {
        viewDetailNote();
    } else if (targetElement.classList.contains("btn-tag-item")) {
        sendTags();
    } else if (targetElement.classList.contains("store_ls")) {
        deleteService(targetElement.classList[1]);
    }
});

function saveWhenChangeService() {
    let lsSer = [];
    currService.forEach(e => {
        lsSer.push(e.id);
    })
    let data = {
        type: 'submitPhone',
        conversation: $('#conversation-code').val(),
        customer: $('#customer-code').val(),
        cus_name: $('#customer-name').val(),
        service: lsSer,
    }
    $('button.submit-send').html('Cập nhật');
    chrome.storage.sync.get(['user_id', 'phone'], function(result) {
        let rq = {...data, ...result }
        chrome.runtime.sendMessage(rq, function(response) {
            chrome.extension.onMessage.addListener(function(res, sender, sendResponse) {
                if (res && res.status && res.type == 'submitPhone') {
                    if (res.status == 400) {
                        setNotify('error', res.message);
                    } else {
                        setNotify('success', res.message);
                        getInFoCus();
                    }
                }
            })

        })
    })
}

function deleteService(id) {
    let index = currService.findIndex(r => {
        return r.id == id;
    })
    currService.splice(index, 1);
    setShowListService();
    saveWhenChangeService();
}

function setShowListService() {
    let serviceHtml = '';
    currService.forEach(e => {
        serviceHtml = serviceHtml + `<span class="label label-success" style="margin: 4px" >
                            ${e.name}
                            <span style="cursor: pointer;" class="store_ls ${e.id} text-danger"  title="Xóa"
                            >&nbsp;&nbsp;x</span>
                            </span>`
    })
    $('.formselect').html(serviceHtml);
}

function set_select2() {
    var a = $('#store_id');
    if (a.length <= 0) {
        setTimeout(() => {
            set_select2();
        }, 1000);
    } else {
        $('.js-example-basic-multiple').select2();
    }
}

function sendTags() {
    setTimeout(() => {
        var tag_array = [];
        var btn_tag = $('.btn-tag-item');
        btn_tag.each(function(index) {
            var alpha = $(this).css("background-color").replace(/^.*,(.+)\)/, '$1');
            if (alpha >= 1 || alpha <= 0) {
                tag_array.push($(this).text())
            }
        });
        let data = {
            type: 'sendTags',
            conversation: $('#conversation-code').val(),
            cus_name: $('#customer-name').val(),
            tags: tag_array,
        }
        chrome.storage.sync.get(['user_id', 'phone'], function(result) {
            let rq = {...data, ...result }
            chrome.runtime.sendMessage(rq, function(response) {
                chrome.extension.onMessage.addListener(function(res, sender, sendResponse) {
                    if (res && res.status && res.type == 'sendTags') {
                        if (res.status == 400) {
                            setNotify('error', res.message);
                        } else {
                            setNotify('success', res.message);
                        }
                    }
                })
            })
        })
    }, 500);
}

function viewDetailInfor() {
    if ($('.on-index').hasClass('active')) {
        $('.on-index').removeClass('active');
        $('.see-more').html('Xem lịch sử');
    } else {
        $('.see-more').html('Đóng');
        $('.on-index').addClass('active');
        document.addEventListener("click", function(event) {
            var x = event.target.closest(".inside, .see-more");
            if (x) {
                return
            } else {
                $('.on-index').removeClass('active');
                $('.see-more').html('Xem lịch sử');
            }
        });
    }
}


function logOut() {
    chrome.storage.sync.remove(['dateLogin', 'phone', 'user_name', 'groupService'], function(result) {
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
    phone_tag.each(function() {
        if ($(this).hasClass('active')) {} else {
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
    chrome.runtime.sendMessage(data, function(response) {})
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
        chrome.runtime.sendMessage(data, function(response) {
            chrome.extension.onMessage.addListener(function(res, sender, sendResponse) {
                if (res && res.type == 'login') {
                    if (res.status == 200) {
                        let datelogin = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
                        chrome.storage.sync.set({
                            'phone': res.user.phone,
                            'dateLogin': datelogin,
                            'user_name': res.user.last_name + res.user.first_name,
                            'user_id': res.user.id
                        }, function() {});
                        setNotify('success', res.message);
                        $('#pageCustomer').removeClass('active');
                    } else {
                        setNotify('error', res.message ? res.message : 'Đã có lỗi xẩy ra. Vui lòng thử lại!');
                    }
                }
                if (res && res.type == 'groupService') {
                    setForm();
                    currService = [];
                    getInFoCus();
                    setTimeout(() => {
                        chrome.storage.sync.get(['user_name'], function(result) {
                            $('.staff-name').html(result.user_name);
                        })
                    }, 200);
                }
            })
        })
    }
}

function getGroupService() {
    chrome.storage.sync.get(['phone'], function(result) {
        let data = {
            type: 'getGroupServices',
            phone: result.phone
        }
        chrome.runtime.sendMessage(data, function(response) {})
    });

}

function toBookApmt() {
    var customer_phone = $('input#cus_phone').val();
    var customer_name = $('#customer-name').val();
    var customer_store = $('#cus_store_id').val();
    if (customer_phone == '' || customer_phone == null) {
        $('input#cus_phone').focus();
    } else {
        chrome.storage.sync.get(['phone'], function(result) {
            if (result && result.phone == '000') {
                base_url = 'http://dev.seoulspa.vn';
            } else {
                base_url = 'http://app.seoulspa.vn'
            }
            var url = base_url + '/appointments/add?name_input=' + customer_name + '&store_input=' + customer_store + '&phone_input=' + customer_phone + '';
            window.open(url, '_blank');
        })
    }
}

function toHistory() {
    var customer_id = $('input#cus_id').val();
    chrome.storage.sync.get(['phone'], function(result) {
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
        page_id: main_param.slice(0, id_pos),
    }
    chrome.runtime.sendMessage(data, function(response) {
        chrome.extension.onMessage.addListener(function(res, sender, sendResponse) {
            $('.main-form.main-two').removeClass('load');
            if (res && res.type == 'getdetail') {
                if (res.status == 1 && res.data) {
                    let data = res.data;
                    var history = data.history;
                    var textHistory = '';
                    if (history) {
                        history.forEach(function(value, index) {
                            var textStatus = '';
                            var cre = formatDate(value.created);

                            if (compareToday(value.created) == 1) {
                                textStatus = '<img src="http://dev.seoulspa.vn/assets/images/processing-panc.svg" class="icon-status">'
                            } else {
                                if (value.status == 0) { textStatus = '<img src="http://dev.seoulspa.vn/assets/images/error-panc.svg" class="icon-status">' } else { textStatus = '<img src="http://dev.seoulspa.vn/assets/images/success-panc.svg" class="icon-status">' };
                            }

                            var note = '';
                            if (value.note !== '' || value.cs_note !== '' || value.adv_note !== '') {
                                var main_note = '';
                                var cs_note = '';
                                var adv_note = '';
                                if (value.note !== '') {
                                    main_note = ` <div><span class="note-tit inside">Ghi chú:</span>${value.note}</div>`;
                                }
                                if (value.cs_note !== '') {
                                    cs_note = `<div><span class="note-tit inside">Ghi chú CSKH:</span>${value.cs_note}</div>`;
                                }
                                if (value.adv_note !== '') {
                                    adv_note = `<div><span class="note-tit inside">Ghi chú TVV:</span>${value.adv_note}</div>`;
                                }
                                note = `
                                    <div class="his-onhover inside">
                                     ${main_note}${cs_note}${adv_note}
                                    </div>
                                `;
                            }
                            textHistory = textHistory +
                                `<div class="his-item inside">
                                <div class="stt inside">${index+1}</div>
                                <div class="store-name inside">${value.store_name}</div>
                                <div class="date-create-his inside">${cre}</div>
                                <div class="his-status inside">${textStatus}</div>
                                ${note}
                            </div>`;
                        })
                    }
                    if (data.customer_sent_code == main_param.slice(id_pos + 1)) {
                        $('input#cus_phone').val(data.customer_phone);
                        $('input#cus_id').val(data.id_cus);
                        if (textHistory != null) {
                            $('.history-board').html(textHistory);
                        }
                        if (data.total_com != null) {
                            $('.report span.value').html(data.total_com + ' lần');
                        }
                        if (data.service) {
                            currService = data.service;
                            setShowListService();
                        } else {
                            $('#store_id').val(0);
                        }
                        if (data.note != null) {
                            $('#cus_note').val(data.note);
                        }
                        if (data.is_old == 0) {
                            $('.customer-status').html('Khách mới');
                        } else {
                            $('.customer-status').html('Khách cũ');
                        }
                        if (data.number_app != 0 || data.id_cus != 0) {
                            $('.customer-status').append('<div class="see-more">Xem lịch sử</div>')
                        }
                        if (data.id_cus == 0) {
                            $('.history_cus').remove();
                        }
                        if (data.store_id != 0) {
                            $('#cus_store_id').val(data.store_id);
                        }
                        if (data.status_app) {
                            $('.customer-status').append('<div class="app_status style' + data.status_app.status + '">' + data.status_app.title + '<span>(' + formatDate(data.status_app.date) + ')</span></div>')
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

function compareToday(date) {
    var today = new Date();
    var d = new Date(date);
    if (d >= today) {
        return 1;
    } else {
        return 0;
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    hour = d.getHours();
    minutes = d.getMinutes();
    if (hour < 10) hour = '0' + hour;
    if (minutes < 10) minutes = '0' + minutes;
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('-') + '  ' + hour + ':' + minutes;
}

function submitPhone() {
    $('button.submit-send').html('•••');
    let service_id = $('#store_id').val();
    if (currService && currService.length > 0) {
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
        chrome.storage.sync.get(['user_id', 'phone'], function(result) {
            let rq = {...data, ...result }
            chrome.runtime.sendMessage(rq, function(response) {
                chrome.extension.onMessage.addListener(function(res, sender, sendResponse) {
                    if (res && res.status && res.type == 'submitPhone') {
                        if (res.status == 400) {
                            setNotify('error', res.message);
                        } else {
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

function submitOnSelect2() {
    setTimeout(() => {
        $('#store_id').on('select2:select', function(e) {
            let service_id = $('#store_id').val();
            if (service_id && service_id.length > 0) {
                let data = {
                    type: 'submitPhone',
                    conversation: $('#conversation-code').val(),
                    customer: $('#customer-code').val(),
                    service: service_id,
                }
                $('button.submit-send').html('Cập nhật');
                chrome.storage.sync.get(['user_id', 'phone'], function(result) {
                    let rq = {...data, ...result }
                    chrome.runtime.sendMessage(rq, function(response) {
                        chrome.extension.onMessage.addListener(function(res, sender, sendResponse) {
                            if (res && res.status && res.type == 'submitPhone') {
                                if (res.status == 400) {
                                    setNotify('error', res.message);
                                } else {
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
    chrome.storage.sync.get(['phone', 'user_name'], function(data) {
        if (data.phone) {
            var user_box = $('#pageCustomer');
            var user_name = user_box.attr('data-clipboard-text');
            var text_option = '';
            if (user_box.length > 0) {
                if (!user_box.hasClass('active')) {
                    user_box.addClass('active');
                    chrome.storage.sync.get(['groupService'], function(result) {
                        var text_option = '';
                        services = result.groupService.data;
                        result.groupService.data.forEach(element => {
                            text_option = text_option + '<option value="' + element.id + '">' + element.name + '</option>'
                        });
                        setShowListService();
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
                                        <div class="d-flex">
                                            <select class="select-option-service" title="Chọn" id="store_id" >${text_option}</select> 
                                            <div style="word-wrap:break-word" class="formselect">
                                        </div>
                                    </div>
                                </div>
                                <input type="text" id="cus_id" style="display:none;">
                                <input type="text" id="cus_store_id" style="display:none;">
                                <div class="form-group" style="position: relative;">
                                     <label for="" style="position: relative;">Ghi chú
                                    </label>
                                      <textarea id="cus_note" rows="3" > </textarea>
                                </div>
                                <div class="form-group" style="margin-bottom: 0"> <button class="submit-send">Cập nhật</button> </div>
                            </div>
                            <div class="main-form main-two" style="margin-top: 15px; padding: 10px;">
                                <div class="customer-status" style="margin:0">Khách mới</div>    
                                <div id="ind" class="on-index inside">
                                    <span class="lable-his inside">Lịch sử gần đây</span>
                                    <div class="history-board inside"></div> 
                                    <div class="history_cus inside">Xem thêm lịch sử khách</div>
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
            chrome.storage.sync.get(['user_id', 'phone'], function(result) {
                let rq = {...data, ...result }
                chrome.runtime.sendMessage(rq, function(response) {
                    chrome.extension.onMessage.addListener(function(res, sender, sendResponse) {
                        if (res && res.status && res.type == 'submitPhone') {
                            if (res.status == 400) {
                                setNotify('error', res.message);
                            } else {
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

$(document).on('keydown', function(e) {
    let text = $('#replyBoxComposer').val();
    message = text != '' ? text : message;
    var phone_tag = $('.phone-tag');
    phone_tag.each(function() {
        if ($(this).hasClass('active')) {} else {
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
        chrome.storage.sync.get(['phone', 'key', 'user_id', 'inboxUserData'], function(result) {
            let rq = {...data, ...result }
            chrome.runtime.sendMessage(rq, function(response) {
                message = '';
                if (response.status == 0) {
                    setNotify('error', 'Bạn chưa đăng nhập vào tiện ích SeoulSpa!')
                }
            });
        });
    }
});

function checklogin() {

    chrome.storage.sync.get(['dateLogin', 'last_update_inbox', 'phone', 'time_send'], function(data) {
        //logout if diff now
        let now = new Date().toJSON().slice(0, 10).replace(/-/g, '/');

        if (data.dateLogin > now) chrome.storage.sync.remove(['key', 'phone', 'staffs', 'user_name', 'groupService'], function(result) { checklogin() });
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
    }, 1000);
}

function setIcon() {
    show_icon();
    chrome.storage.sync.get(['user_name'], function (result) {
        $('.staff-name').html(result.user_name);
    })
    setTimeout(() => {
        setIcon();
    }, 3000);
}
function setClicked() {
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

function getConversationCode() {
    const forkUrl = document.getElementById("linkConversation").getAttribute('data-clipboard-text');
    var url = forkUrl;
    var search = url.indexOf('=');
    var main_param = url.slice(search + 1);
    return main_param;
}


function setStyleBox() {
    $('head').append(`<style>
                span.lable-his{
                    display: block;
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: bold;
                    color: #c83c53;
                    font-size: 16px;
                    margin-bottom: 15px;
                    border-bottom: 1px solid;
                }
                .note-tit {
                    font-size: 13px;
                    font-weight: bold;
                    width: 35%;
                    display: inline-block;
                }
                .his-item:hover {
                    background: rgba(128, 128, 128, 0.14);
                }
                .his-onhover {
                    position: absolute;
                    left: 20px;
                    width: 100%;
                    height: auto;
                    bottom: 100%;
                    background: #fbfbfb;
                    padding: 10px !important;
                    border-radius: 3px;
                    opacicty: 0;
                    visibility: hidden;
                    border: 1px solid rgba(128, 128, 128, 0.48);
                    font-size: 13px;

                }
                .his-item:hover .his-onhover{
                    opacicty: 1;
                    visibility: unset;
                }
                .history-board > div {
                    cursor: pointer;
                    position: relative;
                    display: flex;
                    border-bottom: 1px solid rgba(173, 168, 168, 0.5215686274509804);
                    padding: 5px 0;
                    transition: .2s all linear;
                }
                .his-item > div {
                    padding: 0 3px;
                }
                .stt {
                    width: 5%;
                }
                .store-name {
                    width: 45%;
                }
                .date-create-his {
                    width: 43%;
                }
                .his-status {
                    width: 7%;
                    display: flex;
                    align-items: center;
                }
                .app_status.style1 {
                    color: rgb(208, 208, 4);
                }
                img.icon-status {
                    width: 14px;
                }
                #customerCol{position:relative;}
                .on-index, .note-onindex{
                    position: absolute;
                    background: white;
                    right: 50%;
                    transform: translateX(50%);
                    opacity: 0;
                    width: 95%;
                    bottom: 0;
                    padding: 10px;
                    border-radius: 3px;
                    transition: .2s all linear;
                    z-index: 0;
                    visibility: hidden;
                    border: 1px solid rgba(130, 128, 128, 0.52);
                }
                .on-index.active, .note-onindex.active{
                    bottom: 100%;
                    opacity: 1;
                    visibility: unset;
                }
                .my-test{
                    overflow-y: auto;
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
                    padding-top:5px;
                    outline: none;
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
                    color: #6767f3;
                    font-weight: normal;
                    font-size: 12px;
                    text-decoration: underline;
                    z-index: 999;
                    cursor: pointer;
                }
                .app_status {
                    font-size: 13px;
                    color: green;
                }
                .app_status span {
                    margin-left: 10px;
                }
                .app_status.style0 {
                    color: rgb(208, 8, 8);
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
                    color: rgb(170, 170, 241);
                    font-size: 12px;
                    margin-top: 15px;
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
                .d-flex {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    width: 100%;
                    justify-content: space-between;
                }
                select#store_id{
                    width: 30px;
                }
                .formselect {
                    width: 80%;
                    display: flex;
                    flex-wrap: wrap;
                    aligh-item: center;
                }
                .formselect .label-success {
                    line-height: 15px;
                    background-color: rgb(135, 49, 78);
                }
                .formselect .text-danger {
                    color: #cbf2ff;
                }
                select#store_id {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-image: url(http://dev.seoulspa.vn/assets/images/hiring.svg);
                    background-size: 22px;
                    background-repeat: no-repeat;
                    background-color: rgba(255, 250, 250, 0);
                    cursor: pointer;
                }
            </style>`);
}