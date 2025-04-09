@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Grouped Data for ZSOSCHEME'
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
    serviceQuality: #X,
    sizeCategory: #S,
    dataClass: #MIXED
}
define view entity ZSOSCHEMEGROUPED as select from ZR_zsoscheme01TP
{
    @EndUserText.label: 'Sales Order'
    key Salesorder,
    @EndUserText.label: 'Company'
    key Bukrs,
    @EndUserText.label: 'Free Qty'
    cast(sum(Freeqty) as abap.int4) as Freeqty,
    @EndUserText.label: 'Order Qty'
    cast(sum(Orderqty) as abap.int4) as OrderQty,
    @EndUserText.label: 'Applied Qty'
    cast(sum(Appliedqty) as abap.int4) as Appliedqty
}
group by Salesorder,Bukrs
