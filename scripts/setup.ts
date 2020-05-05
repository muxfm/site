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
  const { body }: { body: Feed } = await got.get(
    metaUrl ||
      "https://raw.githubusercontent.com/bulwarkfm/glue/gh-pages/public/meta.json",
    {
      responseType: "json",
    }
  );
  if (!body.title || !body.author) throw new Error("Unable to parse JSON URL");
  const pkg: any = JSON.parse(
    (await fs.readFile(join(".", "package.json"))).toString()
  );

  pkg.scripts = pkg.scripts || {};
  delete pkg.scripts.setup;
  pkg.scripts.build = "site build";
  pkg.scripts.watch = "site watch";
  pkg.scripts.serve = "site serve";
  pkg.scripts.start = "npm run serve";

  delete pkg.repository;
  delete pkg.keywords;
  delete pkg.bugs;
  delete pkg.homepage;

  const { githubUrl }: { githubUrl?: string } = await prompt([
    {
      name: "githubUrl",
      message:
        "Is your podcast open source? If yes, enter the repositor URL here, otherwise press enter to skip",
    },
  ]);

  await fs.writeFile(
    join(".", "package-example.json"),
    JSON.stringify(pkg, null, 2)
      .replace(/PODCAST_NAME/g, body.title)
      .replace(/AUTHOR_NAME/g, body.author)
  );
  console.log(
    "Done! Run `npm run build` to build your site or `npm run serve` to see it live."
  );
};

setup();
