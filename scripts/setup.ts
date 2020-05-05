import { prompt } from "inquirer";
import { promises as fs } from "fs";
import { join } from "path";
import got from "got";

interface Feed {
  "itunes:category": string[];
  image: string;
  author: string;
  lastBuildDate: string;
  title: string;
  link: string;
  copyright: string;
  generator: string;
  language: string;
  description: string;
}

const setup = async () => {
  const { metaUrl }: { metaUrl: string } = await prompt([
    {
      name: "metaUrl",
      message: "Meta JSON URL",
    },
  ]);
  console.log("Fetching...");
  const { body }: { body: Feed } = await got.get(metaUrl, {
    responseType: "json",
  });
  if (!body.title || !body.author) throw new Error("Unable to parse JSON URL");
  const pkg: any = JSON.parse(
    (await fs.readFile(join(".", "package.json"))).toString()
  );
  await fs.writeFile(join(".", "package-example.json"), pkg);
};

setup();
