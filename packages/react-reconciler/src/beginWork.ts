import { ReactElementType } from 'shared/ReactTypes';
import { reconcileChildFibers, mountChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { renderWithHooks } from './fiberHooks';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';

/**
 * DFS（深度优先遍历）的顺序遍历 ReactElement，这意味着：
 * 如果有子节点，遍历子节点；
 * 如果没有子节点，遍历兄弟节点；
 * !这是个递归的过程，存在递、归两个阶段：递：对应beginWork；归：对应completeWork
 */
export const beginWork = (wip: FiberNode) => {
	/**
	 * *beginWork 函数的作用是：
	 * 比较 ReactElement 和 fiberNode 产生各种标记，
	 * 返回子fiberNode
	 * */
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case FunctionComponent:
			return updateFunctionComponent(wip);
		case HostText:
			return null;
		default:
			if (__DEV__) {
				console.warn('beginWork 未实现的类型');
			}
			break;
	}
	return null;
};

function updateFunctionComponent(wip: FiberNode) {
	const nextChildren = renderWithHooks(wip);
	reconcileChildren(wip, nextChildren);

	return wip.child;
}

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;

	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);

	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);

	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate;
	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount （只有在初始化操作中才会有大量的 flags 生成）
		wip.child = mountChildFibers(wip, null, children);
	}
}
