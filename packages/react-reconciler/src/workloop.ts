import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode } from './fiber';
let worklInProgress: FiberNode | null = null;

function prepareFreshStack(fiber: FiberNode) {
	worklInProgress = fiber;
}

function renderRoot(root: FiberNode) {
	// 初始化
	prepareFreshStack(root);

	// 执行递归的操作
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.log('workLoop发生错误', e);
			worklInProgress = null;
		}
	} while (true);
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
