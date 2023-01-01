import { mkdir, writeFile } from "fs/promises";

const createPersonalInfoJSON = async () => {
    const filename = "personal_info.json";
    const structure = {
        work_status: "open",
        email: "",
        socials: { telegram: "", linkedin: "", dribbble: "", github: "" },
    };
    await writeFile(`./static/${filename}`, JSON.stringify(structure), { flag: "wx" }).catch((e) => console.log(e));
};

const createTermsAndConditionsJSON = async () => {
    const filename = "terms_and_conditions.json";
    const structure = { text: "" };
    await writeFile(`./static/${filename}`, JSON.stringify(structure), { flag: "wx" }).catch((e) => console.log(e));
};

export default async () => {
    const staticFolderList = ["static", "storage", "storage/public", "storage/private", "storage/public/project_images", "storage/public/tech_and_tools_images"];

    for (let i = 0; i < staticFolderList.length; i++) await mkdir(`./${staticFolderList[i]}`, { recursive: true }).catch((e) => console.log(e));
    await Promise.all([createPersonalInfoJSON(), createTermsAndConditionsJSON()]);
};
