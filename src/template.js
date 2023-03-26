"use strict";
import fs from 'fs';
import yaml from 'js-yaml';
import assert from 'check-types';
import { extractPipelineName } from './util.js';

const BB_IMAGE = "atlassian/default-image:latest";
const BB_TEMPLATE_DOC =
  "https://confluence.atlassian.com/bitbucket/configure-bitbucket-pipelines-yml-792298910.html";

export function readTemplate(bbTemplate) {
  if (!fs.existsSync(bbTemplate)) {
    throw new Error(`${bbTemplate} can't be found`);
  }

  const config = yaml.safeLoad(fs.readFileSync(bbTemplate, "utf8"));
  return new Template(config);
}

export function parse(config) {
  assert.nonEmptyString(config);
  const jsonConfig = yaml.safeLoad(config);
  validate(jsonConfig);
  return jsonConfig;
}

export function findPipeline(config, pipeline, pipelineName) {
  assert.nonEmptyObject(config);
  assert.nonEmptyString(pipeline);

  if (pipeline === "default") {
    if (!config.pipelines.default) {
      throw new Error("default pipeline not found");
    } else {
      return config.pipelines.default;
    }
  } else {
    assert.nonEmptyString(pipelineName);
    assert.nonEmptyObject(
      config.pipelines[pipeline],
      `pipeline "${pipeline}" not found`
    );
    return config.pipelines[pipeline][pipelineName];
  }
}

export function findStepInPipeline(pipeline, stepName) {
  for (let i = 0; i < pipeline.length; i++) {
    if (pipeline[i].step && pipeline[i].step.name === stepName) {
      return pipeline[i];
    } else if (pipeline[i].parallel) {
      return findStepInPipeline(pipeline[i].parallel, stepName);
    }
  }
}

export function validate(config) {
  try {
    assert.nonEmptyObject(
      config,
      "build configuration is empty or invalid yaml"
    );
    assert.nonEmptyObject(
      config.pipelines,
      "'pipelines' section invalid or not found"
    );
  } catch (error) {
    throw new Error(
      `${error.message}\nMalformed template, check ${BB_TEMPLATE_DOC}`
    );
  }
}

export class Pipeline {
  constructor(config) {
    this.config = config;
  }

  getStep(stepName) {
    return findStepInPipeline(this.config, stepName);
  }

  getAllSteps() {
    const result = [];

    const findStepsRecursively = stepList => {
      stepList.forEach(x => {
        if (x.step) {
          result.push(x.step);
        } else if (x.parallel) {
          findStepsRecursively(x.parallel);
        }
      });
    };

    findStepsRecursively(this.config);
    return result;
  }
}

export class Template {
  constructor(config) {
    validate(config);
    this.config = config;
  }

  getPipeline(name = "default") {
    const { pipeline, pipelineName } = extractPipelineName(name);
    const pipelineConfig = findPipeline(this.config, pipeline, pipelineName);
    return new Pipeline(pipelineConfig);
  }

  getRootImage() {
    return this.config.image ? this.config.image : BB_IMAGE;
  }
}
