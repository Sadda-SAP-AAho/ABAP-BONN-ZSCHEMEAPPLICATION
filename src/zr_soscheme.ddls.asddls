@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'SO Scheme View'
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
    serviceQuality: #X,
    sizeCategory: #S,
    dataClass: #MIXED
}
define view entity ZR_SOSCHEME as select from zsoscheme
{
    key bukrs as Bukrs,
    key salesorder as Salesorder,
    key schemecode as Schemecode,
    key schemegroupcode as Schemegroupcode,
    schemecheckcode as Schemecheckcode,
    orderqty as Orderqty,
    freeqty as Freeqty,
    appliedqty as Appliedqty,
    created_by as CreatedBy,
    created_at as CreatedAt,
    last_changed_by as LastChangedBy,
    last_changed_at as LastChangedAt,
    local_last_changed_at as LocalLastChangedAt
}
