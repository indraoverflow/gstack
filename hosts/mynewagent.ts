import { defineHost, preambleToolGlossary, sharedRuntimeRoot } from './define-host';

const mynewagent = defineHost({
  name: 'mynewagent',
  displayName: 'MyNewAgent',
  tier: 'experimental',
  capabilities: { toolExecution: true, questions: 'native', planMode: true, delegation: true, browser: true, safetyHooks: 'advisory' },
  globalRoot: '.config/mynest/skills/gstack',
  toolRewrites: preambleToolGlossary('**MyNewAgent tool names:** `AskUserQuestion` means your `question` tool; there is no `mcp__*__AskUserQuestion` variant. If a step says to call `ExitPlanMode`, tell the user the plan is ready and wait instead.'),
  runtimeRoot: sharedRuntimeRoot(['qa/templates', 'qa/references']),
});

export default mynewagent;
