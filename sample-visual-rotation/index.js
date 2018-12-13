/**
 * tree > root > subtree + links + descendants > left + right
 */

const TRANSITION_TIME = '3.0s';

function changePaths(element, pathToElement) {
    const currentPath = /(path-[01]*)/.exec(element.className)[1],
        branches = element.querySelectorAll('[class*="path-"]');
    element.className = element.className.replace(currentPath, `path-${pathToElement}`);
    Array.prototype.forEach.call(branches, branch => branch.className = branch.className.replace(currentPath, `path-${pathToElement}`));
}

function relativeBoundingRect(container, element) {
    const containerBR = container.getBoundingClientRect(),
        elementBR = element.getBoundingClientRect();
    elementBR.x = elementBR.x - containerBR.x;
    elementBR.y = elementBR.y - containerBR.y;
    return elementBR;
}

function detach(element, elementBR) {
    element = element.parentNode.removeChild(element);
    element.style.height = `${elementBR.height}px`;
    element.style.left = `${elementBR.x}px`;
    element.style.top = `${elementBR.y}px`;
    element.style.width = `${elementBR.width}px`;
    return element;
}

function reattach(pivot, element, elementBR, pivotX, pivotY) {
    elementBR.x = elementBR.x - pivotX;
    elementBR.y = elementBR.y - pivotY;
    element.style.left = `${elementBR.x}px`;
    element.style.top = `${elementBR.y}px`;
    pivot.appendChild(element);
}

function reattachToLazySusans(context, parent, child) {
    const parentRect = relativeBoundingRect(context, parent),
        childRect = relativeBoundingRect(context, child),
        parentLazySusan = document.createElement('div'),
        childLazySusan = document.createElement('div'),
        childLSX = (parentRect.x + parentRect.width / 2 + childRect.x + childRect.width / 2) / 2,
        childLSY = (parentRect.y + childRect.y) / 2,
        parentLSX = (parentRect.x + parentRect.width / 2) * 2 - childLSX,
        parentLSY = childLSY,
        commonLazySusanStyle = { height: 0, position: 'absolute', width: 0 },
        childLazySusanStyle = { left: `${childLSX}px`, top: `${childLSY}px` },
        parentLazySusanStyle = { left: `${parentLSX}px`, top: `${parentLSY}px` },
        commonElemStyle = { 'transform-origin': '50% 0 0' },
        transitionStyle = { transition: `all ${TRANSITION_TIME} ease` };

    context.appendChild(childLazySusan);
    // childLazySusan.style.border = '1px solid red';
    Object.assign(childLazySusan.style, commonLazySusanStyle, childLazySusanStyle, transitionStyle);

    context.appendChild(parentLazySusan);
    // parentLazySusan.style.border = '1px solid yellow';
    Object.assign(parentLazySusan.style, commonLazySusanStyle, parentLazySusanStyle, transitionStyle);

    reattach(childLazySusan, detach(child, childRect), childRect, childLSX, childLSY);
    // child.style.border = '1px solid blue';
    Object.assign(child.style, commonElemStyle, transitionStyle);

    reattach(parentLazySusan, detach(parent, parentRect), parentRect, parentLSX, parentLSY);
    // parent.style.border = '1px solid green';
    Object.assign(parent.style, commonElemStyle, transitionStyle);

    return [parentLazySusan, parentRect, childLazySusan, childRect];
}

let rotationNumber = 0;
function rotate(path, childSubPath, middleSubPath, parentNewSubPath, middleNewSubPath, lazySusanRotationSign, elementsRotationSign) {
    ++rotationNumber;
    let childReattached = false,
        parentReattached = false,
        parentTransitionEnded = false,
        middleTransitionEnded = false,
        parentLSTransitionEnd,
        childLSTransitionEnd,
        parentTransitionEnd,
        childTransitionEnd,
        middleTransitionEnd;
    const tree = document.querySelector('.tree'),
        side = path ? path.substr(path.length - 1) : '',
        parentBranchSelector = `.path-${path}`,
        parentBranchContainerSelector = path ? parentBranchSelector.substr(0, parentBranchSelector.length - 1) + ' > .descendants' : '.tree',
        childBranchSelector = parentBranchSelector + childSubPath,
        middleBranchSelector = childBranchSelector + middleSubPath,
        parentBranchContainer = document.querySelector(parentBranchContainerSelector),
        parentBranch = document.querySelector(parentBranchSelector),
        childBranchContainer = document.querySelector(parentBranchSelector + ' > .descendants'),
        childBranch = document.querySelector(childBranchSelector),
        middleBranchContainer = document.querySelector(childBranchSelector + ' > .descendants'),
        middleBranch = document.querySelector(middleBranchSelector),
        parentOriginalBR = parentBranch.getBoundingClientRect(),
        middleBR = middleBranch ? relativeBoundingRect(tree, middleBranch) : {},
        [parentLazySusan, parentBR, childLazySusan, childBR] = reattachToLazySusans(tree, parentBranch, childBranch),
        middleNewLeft = parentOriginalBR.x + (middleNewSubPath === '1' ? 0.5 : 1) * childBR.width,
        parentTransitionEndFunctor = function (event, rot) {
            if (childReattached) {
                parentBranch.style = {};
                // parentLazySusan.removeChild(parentBranch);
                // tree.removeChild(parentLazySusan);
                if (parentNewSubPath === '0') {
                    parentBranch.className = parentBranch.className.replace(/(left|right|root)/, 'left');
                    middleBranchContainer.insertBefore(parentBranch, middleBranchContainer.firstChild);
                } else {
                    parentBranch.className = parentBranch.className.replace(/(left|right|root)/, 'right');
                    middleBranchContainer.appendChild(parentBranch);
                }
                changePaths(parentBranch, path + parentNewSubPath);
                parentReattached = true;
                // TODO: Change links.
                if (middleTransitionEnded) { middleTransitionEndFunctor({ propertyName: 'left', stopPropagation: () => {} }); }
            }
            parentTransitionEnded = true;
        },
        childTransitionEndFunctor = function (event, rot) {
            childBranch.style = {};
            // childLazySusan.removeChild(childBranch);
            // tree.removeChild(childLazySusan);
            if (side === '0') {
                childBranch.className = childBranch.className.replace(/(left|right)/, 'left');
                // childBranch.className = `left path-${path}`;
                parentBranchContainer.insertBefore(childBranch, parentBranchContainer.firstChild);
            } else if (side === '1') {
                childBranch.className = childBranch.className.replace(/(left|right)/, 'right');
                // childBranch.className = `right path-${path}`;
                parentBranchContainer.appendChild(childBranch);
            } else {
                childBranch.className = childBranch.className.replace(/(left|right)/, 'root');
                parentBranchContainer.appendChild(childBranch);
            }
            changePaths(childBranch, path);
            childReattached = true;
            // TODO: Change links.
            if (parentTransitionEnded) { parentTransitionEndFunctor({ propertyName: 'left', stopPropagation: () => {} }); }
        },
        middleTransitionEndFunctor = function (event, rot) {
            if (parentReattached) {
                middleBranch.style = {};
                try { tree.removeChild(middleBranch); } catch (e) {}
                if (middleNewSubPath === '0') {
                    middleBranch.className = middleBranch.className.replace(/(left|right)/, 'left');
                    childBranchContainer.insertBefore(middleBranch, childBranchContainer.firstChild);
                } else {
                    middleBranch.className = middleBranch.className.replace(/(left|right)/, 'right');
                    childBranchContainer.appendChild(middleBranch);
                }
                changePaths(middleBranch, path + parentNewSubPath + middleNewSubPath);
            }
            middleTransitionEnded = true;
        };
    childTransitionEnd = childBranch.addEventListener('transitionend', childTransitionEndFunctor, { once: true });
    parentTransitionEnd = parentBranch.addEventListener('transitionend', parentTransitionEndFunctor, { once: true });
    middleTransitionEnd = middleBranch ? middleBranch.addEventListener('transitionend', middleTransitionEndFunctor, { once: true }) : null;
    parentLSTransitionEnd = parentLazySusan.addEventListener('transitionend', function (event) {
        if (event.propertyName === 'transform') {
            try { tree.removeChild(parentLazySusan); } catch (e) {}
        }
    }, { once: true });
    childLSTransitionEnd = childLazySusan.addEventListener('transitionend', function (event) {
        if (event.propertyName === 'transform') {
            try { tree.removeChild(childLazySusan); } catch (e) {}
        }
    }, { once: true });

    if (middleBranch) {
        detach(middleBranch, middleBR);
        tree.appendChild(middleBranch);
        // middleBranch.style.border = '1px solid purple';
        middleBranch.style.transition = `all ${TRANSITION_TIME} ease`;
    }

    window.setTimeout(function () {
        parentLazySusan.style.transform = `rotate(${lazySusanRotationSign}180deg)`;
        parentBranch.style.transform = `rotate(${elementsRotationSign}180deg)`;
        Object.assign(parentBranch.style, { height: `${childBR.height}px`, left: `${childBR.x}px`, width: `${childBR.width}px` });

        childLazySusan.style.transform = `rotate(${lazySusanRotationSign}180deg)`;
        childBranch.style.transform = `rotate(${elementsRotationSign}180deg)`;
        Object.assign(childBranch.style, { height: `${parentBR.height}px`, left: `${parentBR.x}px`, width: `${parentBR.width}px` });

        if (middleBranch) {
            middleBranch.style.left = `${middleNewLeft}px`;
        }
    }, 100); // TODO: See why it won't work with 0 timeout.
}

function rotateLeft(path) {
    rotate(path, '1', '0', '0', '1', '-', '');
}

function rotateRight(path) {
    rotate(path, '0', '1', '1', '0', '', '-');
}

