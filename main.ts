import { run } from './src/main';

declare type process = any;

run(process.env.PORT || 3000);
