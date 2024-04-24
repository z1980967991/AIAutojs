
const getNowPage = () => {
    let nowPage = '';
    while (true) {
        sleep(1000)
        if (textContains("首页").exists() && textContains("消息").exists() && textContains("我的").exists()) {
            nowPage = "首页"
            break
        }
        if (textContains('登 录').exists()) {
            nowPage = '登录页'
            break
        }

        if (textContains("新增缺陷/隐患").exists() && textContains("新增").exists()) {
            nowPage = "新增缺陷页"
            break
        }
        if (textContains("缺陷隐患").exists() && textContains("未处理").exists() && textContains("已处理").exists()) {
            nowPage = "缺陷隐患页"
            break
        }
        if (textContains("巡视消缺").exists() && textContains("配网巡视").exists() && textContains("保电任务").exists()) {
            nowPage = "巡视消缺页"
            break
        }
    }
    console.log("当前页面：" + nowPage)
    return nowPage
}

const login = (name, pwd) => {
    setText(0, "")
    input(1, "")
    setText(0, "")
    console.log("进入登录页面，输入账号密码")
    setText(0, name);
    sleep(200)
    setText(1, pwd);
    sleep(200)
    click("登 录");
}

const clickObj = (obj) => {
    const x1 = obj.bounds().left
    const x2 = obj.bounds().right
    const x = ((x2 - x1) / 2) + x1
    const y1 = obj.bounds().bottom
    const y2 = obj.bounds().top
    const y = ((y1 - y2) / 2) + y2
    click(x, y + 5)
    sleep(500)
}

const completeFrom = () => {
    console.log("填写缺陷信息")
    const preSubmitData = {
        source: '巡视（人巡）',
        deviceType: '站房',
        deviceName: '植物园变电站',
        line: '',
        questionType: '缺陷-电缆线路-中间接头',
        tower: '',
        questionDesc: '这里是输入的缺陷描述',
        handleWay: '运维处理',
    }
    console.log("填写缺陷信息")

    console.log('填写来源:' + preSubmitData.source)
    // 选择来源 来源和实际不一样
    if (!textContains('来源').findOne().text().includes(preSubmitData.source)) {
        clickObj(textContains('来源').findOne())
        sleep(500)
        clickObj(textContains(preSubmitData.source).findOne())
        sleep(500)
    } else {
        console.log('来源和目标一致')
    }
    console.log('选择设备类型:' + preSubmitData.deviceType)
    // 选择设备类型
    click(preSubmitData.deviceType)
    sleep(1000)
    // 选择设备名称
    textContains('设备名称').findOne().click()
    sleep(1000)
    text('搜索').waitFor()
    // className('android.view.View').depth(9).drawingOrder(0).indexInParent(3).clickable(true).waitFor();
    // sleep(1000)
    // clickObj(className('android.view.View').depth(9).drawingOrder(0).indexInParent(3).findOne())
    // sleep(500)
    // clickObj(text('搜索').findOne())
    sleep(1000)
    console.log('选择设备名称:' + preSubmitData.deviceName)
    if (preSubmitData.deviceType === '线路') {
        className("android.widget.EditText").depth(12).drawingOrder(0).indexInParent(0).findOne().setText(preSubmitData.deviceName);
    }
    if (preSubmitData.deviceType === '站房') {
        className("android.widget.EditText").depth(11).drawingOrder(0).indexInParent(0).findOne().setText(preSubmitData.deviceName);
    }
    sleep(200)
    clickObj(text('搜索').findOne())
    sleep(1000)
    while (textContains('加载中').exists()) {
        console.log('加载中')
        sleep(2000)
    }
    clickObj(textContains(preSubmitData.deviceName).findOnce(1))
    sleep(500)
    if (preSubmitData.line !== '' && preSubmitData.deviceType !== '站房') {
        console.log('选择线路')
        clickObj(textContains(preSubmitData.line).findOne())
        sleep(500)
    }
    if (preSubmitData.deviceType !== '站房') {
        clickObj(textContains('确认').findOne())
    }
    sleep(2000)
    console.log("设备选择完毕")

    // 选择问题类型
    console.log('选择问题类型：' + preSubmitData.questionType)
    textContains('问题类型').findOne().click()
    sleep(500)
    clickObj(text(preSubmitData.questionType.split("-")[0]).findOne())
    sleep(1000)
    clickObj(text(preSubmitData.questionType.split("-")[1]).findOne())
    sleep(1000)
    clickObj(text(preSubmitData.questionType.split("-")[2]).findOne())
    sleep(1000)
    console.log("问题类型完毕")

    if (preSubmitData.deviceType === '线路' && preSubmitData.tower) {
        // 选择杆塔
        textContains('所属杆塔').findOne().click()
        sleep(1000)
    }

    console.log('问题描述：' + preSubmitData.questionType)
    // 输入问题类型
    setText(0, preSubmitData.questionDesc)
    sleep(500)
    console.log('问题描述输入完毕')
    console.log('准备拍摄图片')
    // 输入图片
    clickObj(className('android.widget.TextView').depth(9).drawingOrder(0).indexInParent(0).findOnce(1))
    sleep(1000)
    toast("3s后拍摄")
    sleep(3000)
    toast('拍摄')
    clickObj(desc('拍照').id('shutter_button').findOne())
    sleep(3000)
    toast('选择照片')
    clickObj(desc('确定').id('done_button').findOne())
    sleep(5000)
    console.log('批注')
    gesture(500, [300, 1000], [800, 1700])
    sleep(500)
    clickObj(text('完成').findOnce())
    sleep(2000)
    while (textContains('加载中').exists()) {
        console.log('加载中')
        sleep(2000)
    }
    console.log('选择处理方式：' + preSubmitData.handleWay)
    // 选择处理方式
    clickObj(textContains(preSubmitData.handleWay).findOne())
    sleep(500)
    console.log('处理方式选择完毕')
    sleep(1000)
    alert('表单填写完成:' + JSON.stringify(preSubmitData))
}

const questionScript = () => {
    launchApp("运检e助手");
    let page = getNowPage()
    if (page === "登录页") {
        login("13909690170", "rpa@1234")
        textContains("消息").waitFor();
        textContains("首页").waitFor();
        textContains("我的").waitFor();
        console.log("进入首页")
    }
    page = getNowPage()
    if (page === "首页") {
        sleep(500)
        click("首页")
        sleep(500)
        click("巡视消缺")
    }
    page = getNowPage()
    if (page === "新增缺陷页") {
        back()
        sleep(500)
    }
    textContains("缺陷隐患").waitFor();
    sleep(500)
    click("缺陷隐患")
    className("android.view.View").depth(10).drawingOrder(0).indexInParent(1).waitFor();
    sleep(500)
    console.log("添加缺陷隐患")
    clickObj(className("android.view.View").depth(10).drawingOrder(0).indexInParent(1).findOne())
    sleep(2000)
    completeFrom()

}

