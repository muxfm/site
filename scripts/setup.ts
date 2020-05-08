import { prompt } from "inquirer";
import { promises as fs } from "fs";
import { join } from "path";
import { config } from "dotenv";
import got from "got";
config();

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
      message: "Glue API dirctory endpoint",
      default: "https://bulwarkfm.github.io/glue/public",
    },
  ]);
  console.log("Fetching...");
  const { body }: { body: Feed } = await got.get(`${metaUrl}/meta.json`, {
    responseType: "json",
  });
  if (!body.title || !body.author) throw new Error("Unable to parse JSON URL");

  const pkg: any = JSON.parse(
    (
      await fs.readFile(
        join(
          ".",
          `package${process.env.TEST_SITE === "test" ? "-example" : ""}.json`
        )
      )
    ).toString()
  );
  pkg.scripts = pkg.scripts || {};
  delete pkg.scripts.setup;
  delete pkg.scripts.demo;
  pkg.scripts.build = "ts-node scripts/build.ts && site build";
  pkg.scripts.watch = "ts-node scripts/build.ts && site watch";
  pkg.scripts.serve = "ts-node scripts/build.ts && site serve";
  pkg.scripts.start = "npm run serve";

  delete pkg.repository;
  delete pkg.keywords;
  delete pkg.bugs;
  delete pkg.homepage;

  pkg.bulwark = pkg.bulwark || {};
  pkg.bulwark.apiUrl = metaUrl;

  const {
    githubUrl,
    baseUrl,
  }: { githubUrl?: string; baseUrl: string } = await prompt([
    {
      name: "githubUrl",
      message:
        "Is your podcast open source? If yes, enter the repositor URL here, otherwise press enter to skip",
    },
    {
      name: "baseUrl",
      message: "Enter the base URL for your site without trailing slash",
      default: "",
    },
  ]);

  await fs.writeFile(
    join(
      ".",
      `package${process.env.TEST_SITE === "test" ? "-example" : ""}.json`
    ),
    JSON.stringify(pkg, null, 2)
      .replace(/PODCAST_NAME/g, body.title)
      .replace(/AUTHOR_NAME/g, body.author)
      .replace(/RSS_URL/g, `${metaUrl}/feed.xml`)
      .replace(/API_URL/g, `${metaUrl}/meta.xml`)
      .replace(/\/episodes/g, `${baseUrl}/episodes`)
      .replace(/\/listen/g, `${baseUrl}/listen`)
  );
  console.log(
    "Done! Run `npm run build` to build your site or `npm run serve` to see it live."
  );
};

setup();
