import { prompt } from "inquirer";

const setup = async () => {
  const { feedUrl }: { feedUrl: string } = await prompt([
    {
      name: "feedUrl",
      message: "Feed URL",
    },
  ]);
  console.log(answers);
};

setup();
