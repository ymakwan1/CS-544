#!/usr/bin/env node

import main from './dist/lib/main.js';

main(process.argv.slice(2)).catch(e => console.error(e));



