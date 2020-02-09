var tableData = [];
var nowPage = 1;
var pageSize = 1;
var allPage = 1;
//绑定事件
function BindEvent() {
    //左侧列表切换
    var menuList = document.getElementsByClassName("menu")[0];
    var modal = document.getElementsByClassName("modal")[0];
    menuList.onclick = function (e) {
        if (e.target.tagName != "DD") {
            return false;
        }
        var actives = document.getElementsByClassName("active");
        // for (var i = 0; i < actives.length; i++) {
        //     actives[i].classList.remove("active");
        // }
        // e.target.classList.add("active");
        initStyle(actives, "class", e.target);
        var id = e.target.getAttribute("data-id");
        var contentBox = document.getElementsByClassName("content-box");
        // for (var j = 0; j < contentBox.length; j++) {
        //     contentBox[j].style.display = "none";
        // }
        // document.getElementById(id).style.display = "block";
        initStyle(contentBox, "style", document.getElementById(id));
    }

    //添加学生
    var studentAddBtn = document.getElementById("student-add-btn");
    studentAddBtn.onclick = function (e) {
        e.preventDefault();  //阻止默认行为
        var form = document.getElementById("student-add-form");
        var data = getFormData(form);
        if (data) {
            var res = saveData('http://open.duyiedu.com/api/student/addStudent', Object.assign({
                appkey: 'MayBe__2020_1581243754070'
            }, data))
            console.log(res)
            if (res.status == "fail") {
                alert(res.msg);
            } else {
                alert("新增成功！");
                var studentList = menuList.getElementsByTagName("DD")[0];
                studentList.click();
                getTableData();
                form.reset();
            }
        }
    }

    //删除列表
    var tbody = document.getElementById("tbody");
    tbody.onclick = function (e) {
        if (e.target.tagName != "BUTTON") {
            return false;
        }
        var isEdit = e.target.classList.contains("edit");
        var index = e.target.dataset.index;
        if (isEdit) {
            modal.style.display = "block";
            renderEditForm(tableData[index]);
        } else {
            console.log('删除');
            var isDel = confirm("确认删除？");
            if (isDel) {
                var res = saveData("http://open.duyiedu.com/api/student/delBySno", {
                    appkey: 'MayBe__2020_1581243754070',
                    sNo: tableData[index].sNo
                });
                if (res.status == "fail") {
                    alert("删除失败!");
                } else {
                    alert("删除成功。");
                    getTableData();
                }
            }

        }
    }

    //信息编辑
    var studentEditBtn = document.getElementById("student-edit-btn");
    studentEditBtn.onclick = function (e) {
        e.preventDefault();
        var form = document.getElementById("student-edit-form");
        var data = getFormData(form);
        if (data) {
            var res = saveData('http://open.duyiedu.com/api/student/updateStudent', Object.assign({
                appkey: 'MayBe__2020_1581243754070'
            }, data))
            if (res.status == "fail") {
                alert(res.msg);
            } else {
                alert("修改成功！");
                modal.style.display = "none";
                getTableData();
            }
        }
    }

    //分页点击事件
    var nextBtn = document.getElementById("next-btn");
    var prevBtn = document.getElementById("prev-btn");
    nextBtn.onclick = function (e) {
        nowPage++;
        getTableData();
    }
    prevBtn.onclick = function (e) {
        nowPage--;
        getTableData();
    }
}




//样式初始化
function initStyle(doms, flag, target) {
    for (var i = 0; i < doms.length; i++) {
        if (flag == "class") {
            doms[i].classList.remove("active");
        } else {
            doms[i].style.display = "none";
        }
    }
    if (flag == "class") {
        target.classList.add("active");
    } else {
        target.style.display = "block";
    }
}

//获取表单数据
function getFormData(form) {
    var name = form.name.value;
    var sNo = form.sNo.value;
    var sex = form.sex.value;
    var address = form.address.value;
    var phone = form.phone.value;
    var birth = form.birth.value;
    var email = form.email.value;
    if (!name || !sNo || !address || !phone || !birth || !email) {
        alert("信息填写不完整")
        return false;
    }
    if (!(/^\d{4,16}$/.test(sNo))) {
        alert("学号应为4-16位数字组成");
        return false;
    }
    if (!(/\w+@+\w+\.com$/.test(email))) {
        alert("邮箱格式不正确");
        return false;
    }
    if (!(/^\d{11}$/.test(phone))) {
        alert("手机号格式错误");
        return false;
    }
    return {
        name,
        sNo,
        address,
        phone,
        birth,
        email,
        sex
    }
}

//获取学生列表数据
function getTableData() {
    // var res = saveData("http://open.duyiedu.com/api/student/findAll", {
    //     appkey: 'MayBe__2020_1581243754070'
    // });
    // tableData = res.data;
    // renderTable(res.data || []);

    transferData("/api/student/findByPage", {
        page: nowPage,
        size: pageSize
    }, function (data) {
        allPage = Math.ceil(data.cont / pageSize);
        console.log(allPage)
        tableData = data.findByPage;
        renderTable(tableData || []);
    })
}

// 渲染表格数据
function renderTable(data) {
    var str = "";
    data.forEach(function (item, index) {
        str += `
        <tr>
            <td>${item.sNo}</td>
            <td>${item.name}</td>
            <td>${item.sex == 0 ? "男" : "女"}</td>
            <td>${item.email}</td>
            <td>${item.birth}</td>
            <td>${item.phone}</td>
            <td>${item.address}</td>
            <td>
                <button class="btn edit" data-index="${index}">编辑</button>
                <button class="btn delete" data-index="${index}">删除</button>
            </td>
        </tr>
        `;
    })
    document.getElementById("tbody").innerHTML = str;
    var nextBtn = document.getElementById("next-btn");
    var prevBtn = document.getElementById("prev-btn");
    if (nowPage < allPage) {
        nextBtn.style.display = "block";
    } else {
        nextBtn.style.display = "none";
    }
    if (nowPage > 1) {
        prevBtn.style.display = "block";
    } else {
        prevBtn.style.display = "none";
    }
}

// 编辑表单的回填
function renderEditForm(data) {
    var form = document.getElementById("student-edit-form");
    // var form = document.getElementById('student-edit-form');
    for (var prop in data) {
        if (form[prop]) {
            form[prop].value = data[prop];
        }
    }
}

//降低代码冗余
function transferData(url, data, cb) {
    var res = saveData('http://open.duyiedu.com' + url, Object.assign({
        appkey: 'MayBe__2020_1581243754070'
    }, data))
    if (res.status == "fail") {
        alert(res.msg);
    } else {
        cb(res.data);
    }
}

BindEvent();
getTableData();

// 向后端存储数据
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object') {
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}