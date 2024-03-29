// 表示 ReactElement 与 fiberNode 对比之后产生的标记
export type Flags = number;
export const NoFlags = 0b0000000;
export const Placement = 0b0000001;
export const Update = 0b0000010;
export const ChildDeletion = 0b0000100;

// mutation 阶段需要执行的操作
export const MutationMask = Placement | Update | ChildDeletion;
