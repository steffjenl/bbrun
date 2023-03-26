import { extractPipelineName } from '../src/util.js';
describe("extractPipelineName", () => {
  it("general case", () => {
    expect(extractPipelineName("foo:bar")).toMatchObject({
      pipeline: "foo",
      pipelineName: "bar"
    });
  });

  it("no pipeline name", () => {
    expect(extractPipelineName("foo")).toMatchObject({
      pipeline: "foo",
      pipelineName: ""
    });
  });

  it("multiple colons", () => {
    expect(extractPipelineName("foo:bar:bar")).toMatchObject({
      pipeline: "foo",
      pipelineName: "bar:bar"
    });
  });
});
