import { channelEvaluator } from "./channels";
import { clockEvaluator } from "./clock";
import { countdownEvaluator } from "./countdown";
import { mathEvaluator } from "./Math";
import { memberDataSourceEvaluator } from "./members";
import { nitroBoostersEvaluator } from "./nitroBoosters";
import { numberEvaluator } from "./number";
import { replaceEvaluator } from "./replace";
import { rolesEvaluator } from "./roles";

const dataSourceEvaluators = [
  memberDataSourceEvaluator,
  channelEvaluator,
  clockEvaluator,
  mathEvaluator,
  countdownEvaluator,
  numberEvaluator,
  rolesEvaluator,
  nitroBoostersEvaluator,
  replaceEvaluator,
];

export default dataSourceEvaluators;
