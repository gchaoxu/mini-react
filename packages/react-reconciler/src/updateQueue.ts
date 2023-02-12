import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';

/**
 * 常见的触发更新的方式：
 * 1. ReactDOM.createRoot().render（或老版的ReactDOM.render）
 * 2. this.setState
 * 3. useState的dispatch方法
 */

/**
 * 我们希望实现一套统一的更新机制，他的特点是：
 * 1. 兼容上述触发更新的方式
 * 2. 方便后续扩展（优先级机制...）
 * */

/**
 * 更新机制的组成部分:
 * 1. 代表更新的数据结构 —— Update
 * 2. 消费update的数据结构 —— UpdateQueue
 */

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>;
};

export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState 1 update (x) => 4x  --> memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 update 2  --> memoizedState 2
			result.memoizedState = action;
		}
	}

	return result;
};
