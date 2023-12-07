export default function getRelativeViewportPosition(clientX, clientY) {
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;
    const percentageX = clientX / clientWidth * 100;
    const percentageY = clientY / clientHeight * 100;
    if (percentageX < 0 || percentageX > 100) throw new Error("Relative value percent not in bounds")
    return [percentageX, percentageY]
}