
export class functions {
    static static_languagevars: any = {};
    public languagevars: any = {};
    protected language: string = '';
    
    constructor() {
        /* Get Language Data */
        this.language = 'english';
        // this.languagevars = this.getLanguageData();
    }



    /**
     * Send output to client with status code and message
     * @param status_code status code of a response
     * @param status status true = 1 OR false = 0
     * @param status_message status message of a response
     * @param data response data
     * @returns object with 3 parameters
     */
    output(status_code: number,status: number, status_message: any, data: any = null) {
        if (this.languagevars[status_message]) status_message = this.languagevars[status_message];

        let output = {
            status: status,
            status_code: status_code,
            status_message: status_message,
            data: data
        };

        /* if (data.length > 0 || Object.keys(data).length) {
            output.data = data;
        } else {
            delete output.data;
        } */

        return output;
    }
}
