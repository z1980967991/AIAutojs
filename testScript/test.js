
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

gesture(500, [300, 1000], [800, 1700])