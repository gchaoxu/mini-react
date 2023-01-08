import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';

let worklInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	worklInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO 调度功能
	// fiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;

	while (parent !== null) {
		node = parent;
		parent = node.return;
	}

	if (node.tag === HostRoot) {
		return node.stateNode;
	}

	return null;
}

function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareFreshStack(root);

	// 执行递归的操作
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.log('workLoop发生错误', e);
			}
			worklInProgress = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	// wip fiberNode 树 && 树中的 flags
	// commitRoot(root);
}

function workLoop() {
	while (worklInProgress !== null) {
		performUnitOfWork(worklInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		worklInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			worklInProgress = sibling;
			return;
		}
		node = node.return;
		worklInProgress = node;
	} while (node !== null);
}
