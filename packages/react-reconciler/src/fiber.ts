import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { NoFlags, Flags } from './fiberFlags';
import { Container } from 'hostConfig';

/**
 * *ReactElement 是一种数据结构，将 JSX转换 playground
 * !ReactElement 如果作为核心模块操作的数据结构，存在的问题：1. 无法表达节点之间的关系；2. 字段有限，不好拓展（比如：无法表达状态）；
 * *所以，需要一种新的数据结构，他的特点：
 * 1. 介于ReactElement与真实UI节点之间；
 * 2. 能够表达节点之间的关系；
 * 3. 方便拓展（不仅作为数据存储单元，也能作为工作单元）；
 * */

export class FiberNode {
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	stateNode: any;
	ref: Ref;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	memoizedProps: Props | null;
	memoizedState: any;
	alternate: FiberNode | null;
	flags: Flags;
	subtreeFlags: Flags;
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		/**
		 * ! 表示实例的属性
		 * tag：记录的是当前 fiberNode 的类型
		 * stateNode：如果当前类型是 HostComponent，比如是一个 <div> 那么 stateNode 保存的就是这个 div（DOM）
		 * type：指的是 FiberNode 类型本身，如：FiberNode 的 tag 是 0，而 type 就是 FunctionComponent () => {} 本身
		 * */
		this.tag = tag;
		this.key = key;
		this.stateNode = null;
		this.type = null;

		/**
		 * !表示节点关系的属性，构成树状结构，分别指向 父级，兄弟以及子级 fiberNode
		 * return： 指向父 fiberNode，这里为什么用 retune 表示呢，个人理解是 fiberNode 使用的是深度优先遍历，在递归回溯的时候 retune 就返回到父级节点了
		 * sibling：指向 右边的兄弟 fiberNode
		 * child：指向 子 fiberNode
		 * index：指的是如果同级的 fiberNode 有好几个，如 <ul> 下面有好几个 <li>，分别对应的就是每个 li 的 index
		 */
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.ref = null;

		/**
		 * ! 作为工作单元
		 * pendingProps：记录的是工作单元开始工作的时候的 props
		 * memoizedProps：记录的是工作完之后的 props，也即是确定下来的 props
		 */
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;

		/**
		 * !双缓存技术
		 * 对于同一个节点，比较其 ReactElement 与 fiberNode ，生成子 fiberNode；
		 * 当所有 ReactElement 比较完后，会生成一棵 fiberNode 树；一共会存在两棵 fiberNode 树：
		 * 1. current：与视图中真实UI对应的 fiberNode 树
		 * 2. workInProgress：触发更新后，正在 reconciler 中计算的 fiberNode 树
		 */

		// !当 current 对应真实 UI 的 fiberNode 树时，alternate 对应 workInProgress 正在计算的 fiberNode 树
		this.alternate = null;

		// !副作用，记录对应标记 Placement | Update | ChildDeletion
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
	}
}

export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null;

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

// 该函数实行双缓存技术，也即函数接收 current，返回对应的 alternate
export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;

	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	wip.child = current.child;
	return wip;
};

export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}

	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;

	return fiber;
}
