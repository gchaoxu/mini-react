import path from 'path';
import fs from 'fs';

import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';

// 在开发环境下增加 __DEV__标识，方便 Dev 包打印更多的信息
import replace from '@rollup/plugin-replace';

// pkg 的路径
const pkgPath = path.resolve(__dirname, '../../packages');

// 打包产物的路径
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pkgPath}/${pkgName}`;
}
export function getPackageJSON(pkgName) {
	// ...包的路径
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, { encoding: 'utf-8' });
	return JSON.parse(str);
}

// 定义公用的函数，用于获取 plugin
export function getBaseRollupPlugins({
	alias = {
		__DEV__: true,
		preventAssignment: true
	},
	typescript = {}
} = {}) {
	// 基础打包需要的插件，一个是 解析 CommonJS 的插件，一个是将 TS 转为 JS 的插件
	return [replace(alias), cjs(), ts(typescript)];
}
