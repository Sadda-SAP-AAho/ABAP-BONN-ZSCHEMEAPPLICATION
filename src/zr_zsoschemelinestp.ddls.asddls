@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@EndUserText.label: 'CDS View forzsoschemelines'
define view entity ZR_zsoschemelinesTP
  as select from zsoschemelines as zsoschemelines
  association to parent ZR_zsoscheme01TP as _zsoscheme on $projection.Bukrs = _zsoscheme.Bukrs and $projection.Salesorder = _zsoscheme.Salesorder 
    and $projection.Schemecode = _zsoscheme.Schemecode and $projection.Schemegroupcode = _zsoscheme.Schemegroupcode
{
  @EndUserText.label: 'Company'
  key bukrs as Bukrs,
  @EndUserText.label: 'Sales Order'
  key salesorder as Salesorder,
  @EndUserText.label: 'Scheme Code'
  key schemecode as Schemecode,
  @EndUserText.label: 'Group Code'
  key schemegroupcode as Schemegroupcode,
  @EndUserText.label: 'Product Code'
  key productcode as Productcode,
  @EndUserText.label: 'Scheme Combination'
  schemecheckcode as Schemecheckcode,
  @EndUserText.label: 'Product Desc'
  productdesc as Productdesc,
  @EndUserText.label: 'Free Qty'
  freeqty as Freeqty,
  created_by as CreatedBy,
  created_at as CreatedAt,
  last_changed_by as LastChangedBy,
  @Semantics.systemDateTime.localInstanceLastChangedAt: true
  last_changed_at as LastChangedAt,
  local_last_changed_at as LocalLastChangedAt,
  _zsoscheme
  
}
