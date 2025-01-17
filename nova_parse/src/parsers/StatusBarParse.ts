import { BaseResource } from "../resource_parsers/NovaResourceBase";
import { StatusBarData, getDefaultStatusBarColors, getDefaultStatusBarDataAreas } from "nova_data_interface/StatusBarData";
import { BaseParse } from "./BaseParse";
import { BaseData } from "nova_data_interface/BaseData";


export async function StatusBarParse(baseResource: BaseResource, notFoundFunction: (m: string) => void): Promise<StatusBarData> {
    var base: BaseData = await BaseParse(baseResource, notFoundFunction);

    // TODO: Parse statusbars
    return {
        ...base,
        image: "nova:700", // The default civilian status bar.
        colors: getDefaultStatusBarColors(),
        dataAreas: getDefaultStatusBarDataAreas()
    }
}
