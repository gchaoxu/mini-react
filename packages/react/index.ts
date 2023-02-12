// React
import { Dispatcher, resolveDispatcher } from './src/currentDispatcher';
import currentDispatcher from './src/currentDispatcher';
import { jsxDEV, jsx, isValidElement as isValidElementFn } from './src/jsx';

export const useState: Dispatcher['useState'] = (initialState: any) => {
	const dispatcher = resolveDispatcher();

	return dispatcher.useState(initialState);
};

// 内部数据共享层
export const __SECRET_INITERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
};

export const version = '0.0.0';
// TODO 根据环境区分使用 jsx/jsxDEV
export const createElement = jsx;
export const isValidElement = isValidElementFn;

// Better Comments 插件的基本使用
/**
 ** Important information is highlighted
 *! Deprecated method, do not use
 *? Should this method be exposed in the public API?
 *TODO: refactor this method so that it conforms to the API
 *@param myParam this parameter for this method
 */
