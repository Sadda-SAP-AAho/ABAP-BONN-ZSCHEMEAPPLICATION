@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Grouped Data for ZSOSCHEME Lines'
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
    serviceQuality: #X,
    sizeCategory: #S,
    dataClass: #MIXED
}
define view entity ZSOSCHEMELINEGROUPED as select from ZR_zsoschemelinesTP
{
 @EndUserText.label: 'Sales Order'
   key Salesorder,
     @EndUserText.label: 'Company'
   key Bukrs,
     @EndUserText.label: 'Scheme Code'
   key Schemecode,
     @EndUserText.label: 'Free Qty'
    sum(Freeqty) as Freeqty
}
group by Salesorder,Bukrs,Schemecode
