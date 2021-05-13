const CallMeta = require('../models/CallMeta')
const CallMetaDataService = function() {
    this.createCallMeta = function(callMetaDTO) {
        return CallMeta.create({
            name: callMetaDTO.name,
            srcPhoneNumber: callMetaDTO.srcPhoneNumber,
            desPhoneNumber: callMetaDTO.desPhoneNumber,
            selectedDuration: callMetaDTO.selectedDuration,
            actualDuration: callMetaDTO.actualDuration,
            endStatus: callMetaDTO.endStatus || 'normal'
        })
    }

}

module.exports = new CallMetaDataService()