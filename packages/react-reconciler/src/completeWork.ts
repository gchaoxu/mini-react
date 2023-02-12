import {
	appendInitialChild,
	Container,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { NoFlags } from './fiberFlags';
import {
	HostComponent,
	HostText,
	HostRoot,
	FunctionComponent
} from './workTags';

export const completeWork = (wip: FiberNode) => {
	// 递归中的归阶段

	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (current && wip.stateNode) {
				// update
			} else {
				// 1. 构建 DOM
				// const instance = createInstance(wip.type, newProps);
				const instance = createInstance(wip.type);
				// 2. 将 DOM 插入到 DOM 树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bobbleProperties(wip);
			return null;
		case HostText:
			if (current && wip.stateNode) {
				// update
			} else {
				// 1. 构建 DOM
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bobbleProperties(wip);
			return null;
		case HostRoot:
			bobbleProperties(wip);
			return null;
		case FunctionComponent:
			bobbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的 completeWorlk 情况', wip);
			}
			break;
	}
};

function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			// 向下查找
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) return;

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) return;
			// 向上递归
			node = node?.return;
		}

		node.sibling.return = node.return;
		node = node.sibling;
	}
}

/**
 * completeWork性能优化策略：flags分布在不同fiberNode中，如何快速找到他们？
 * 利用completeWork向上遍历（归）的流程，将子fiberNode的flags冒泡到父fiberNode；
 * */
function bobbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}

	wip.subtreeFlags |= subtreeFlags;
}
