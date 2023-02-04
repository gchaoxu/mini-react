import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let worklInProgress: FiberNode | null = null;

/**
 * react内部3个阶段：
 * 1. schedule阶段
 * 2. render阶段（beginWork completeWork）
 * 3. commit阶段（commitWork）
 * */

function prepareFreshStack(root: FiberRootNode) {
	worklInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO 调度功能
	// fiberRootNode
	// 更新可能发生于任意组件，而更新流程是从根节点递归的
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
	commitRoot(root);
}

/**
 * commit阶段的3个子阶段：
 * 1. beforeMutation 阶段
 * 2. mutation 阶段
 * 3. layout 阶段
 */
function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;

	if (finishedWork === null) {
		return;
	}

	if (__DEV__) console.warn('commit 阶段开始', finishedWork);

	// 重置
	root.finishedWork = null;

	// 判断是否存在3个阶段需要执行的操作
	// root flags  or root subtreeFlags

	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;

	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutation （Placement 对应宿主环境的操作）
		commitMutationEffects(finishedWork);
		/**
		 * 双缓存机制发生在 mutation 和 layout 阶段之间
		 * */
		root.current = finishedWork;
		// layout
	} else {
		root.current = finishedWork;
	}
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
