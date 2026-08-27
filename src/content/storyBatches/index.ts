import type { Story } from "../types";
import { stories as batch1 } from "./batch1";
import { stories as batch2 } from "./batch2";
import { stories as batch3 } from "./batch3";
import { stories as batch4 } from "./batch4";
import { stories as batch5 } from "./batch5";

export const trendStories: Story[] = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5];
